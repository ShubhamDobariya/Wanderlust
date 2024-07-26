const { types } = require("joi");
const Listing = require("../models/listing.js");

// index
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

// New-Form Render
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// Show
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }
  // console.log(listing);
  res.render("./listings/show.ejs", { listing });
};

// Create
module.exports.createListing = async (req, res, next) => {
  const API_KEY = "87NSRzWYtv-hB3_y5qP93-AUTA5FN9vdLAgereiInws";
  let response = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      req.body.listing.location
    )}&apiKey=${API_KEY}`
  );

  let jsonResponse = await response.json();
  let lat = jsonResponse.items[0].position.lat;
  let lng = jsonResponse.items[0].position.lng;
  let geometry = {
    coordinates: [lat, lng],
  };

  let url = req.file.path;
  let filename = req.file.filename;

  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = geometry;
  let saved = await newlisting.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Edit-Form Render
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_350");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

// Update
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (
    req.body.listing.location &&
    req.body.listing.location !== listing.location
  ) {
    const API_KEY = "87NSRzWYtv-hB3_y5qP93-AUTA5FN9vdLAgereiInws";
    let response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        req.body.listing.location
      )}&apiKey=${API_KEY}`
    );

    let jsonResponse = await response.json();
    if (jsonResponse.items && jsonResponse.items.length > 0) {
      let lat = jsonResponse.items[0].position.lat;
      let lng = jsonResponse.items[0].position.lng;
      let geometry = {
        coordinates: [lat, lng],
      };

      req.body.listing.geometry = geometry;
    }
  }

  listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
