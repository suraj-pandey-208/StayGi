const Listing=require("../models/listing")

module.exports.index=(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
})


module.exports.new=(req, res) => {
    res.render("listings/new.ejs");
}
module.exports.show=(async (req, res) => {

        const listing = await Listing.findById(req.params.id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing does not exist");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    })


    // CREATE ROUTE

    module.exports.create=(async (req, res) => {
    
           let url=req.file.path
           let filename=req.file.filename
            const newListing = new Listing(req.body.listing);

    
            // ⭐ Assign owner
            newListing.owner = req.user._id;
    newListing.image={url,filename}
            await newListing.save();
    
            req.flash("success", "New Listing Created Successfully");
            res.redirect("/listings");
        })

        // EDIT ROUTE
        module.exports.edit=(async (req, res) => {
        
                const listing = await Listing.findById(req.params.id);
        
                if (!listing) {
                    req.flash("error", "Listing does not exist");
                    return res.redirect("/listings");
                }
        
                //  OWNER CHECK
                if (!listing.owner.equals(req.user._id)) {
                    req.flash("error", "You don't have permission");
                    return res.redirect(`/listings/${listing._id}`);
                }
        
                res.render("listings/edit.ejs", { listing });
            })

            //UPDATE ROUTE
          module.exports.update=   (async (req, res) => {
            
                    let { id } = req.params;
            
                    let listing = await Listing.findById(id);
            
                    if (!listing) {
                        throw new ExpressError(404, "Listing Not Found");
                    }
            
                    // ⭐ OWNER CHECK
                    if (!listing.owner.equals(req.user._id)) {
                        req.flash("error", "You don't have permission to edit");
                        return res.redirect(`/listings/${id}`);
                    }
            
                  let listingUp=  await Listing.findByIdAndUpdate(id, req.body.listing);

                  if(typeof req.file!="undefined"){

                  
                  let url=req.file.path;
                  let filename=req.file.filename
                  listingUp.image={url,filename}
                  await listingUp.save()
                  }
                    req.flash("success", "Listing Updated Successfully");
                    res.redirect(`/listings/${id}`);
                })

                // DELETE ROUTE
                module.exports.delete=(async (req, res) => {
                
                        let listing = await Listing.findById(req.params.id);
                
                        if (!listing) {
                            throw new ExpressError(404, "Listing Not Found");
                        }
                
                        // ⭐ OWNER CHECK
                        if (!listing.owner.equals(req.user._id)) {
                            req.flash("error", "You don't have permission to delete");
                            return res.redirect(`/listings/${req.params.id}`);
                        }
                
                        await Listing.findByIdAndDelete(req.params.id);
                
                        req.flash("success", "Listing Deleted Successfully");
                        res.redirect("/listings");
                    })