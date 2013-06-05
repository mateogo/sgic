window.AssetView = Backbone.View.extend({
    /**
     *  Constructor en main.js:
     *        new AssetView({{model: asset})
     *
     */

    whoami:'AssetView',

    initialize: function () {
        this.render();
    },

    render: function () {
        //Renderizar el modelo usando la vista template 
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        
        "change"           : "change",
        "click .save"      : "beforeSave",
        "click .delete"       : "deleteAsset",
        /*
        "dragover #picture" : "dragoverHandler",
        "drop #picture"     : "dropHandler"
        */
    },

    change: function (event) {
        /**
         *  event:
         *   event.target.name: model property
         *   event.target.value: model value
         *   event.target.id model key
         *  
         *   this.model.set( {prop1:newValue1, prop2,newValue2 }  )
         */

        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        //utils.showAlert('Success!', 'name:['+target.name+'] value:['+target.value+'] key:['+target.id+']', 'alert-success');

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            // OjO: mantengo la variable eventdate en paralelo con eventdatestr
            //      eventdate es la representacion numerica de Date
           utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveAsset();
        return false;
    },

    saveAsset: function () {
        var self = this;
        //console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();

                utils.approuter.navigate('activos/' + model.id, false);
                utils.showAlert('Success!', 'Asset saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    deleteAsset: function () {
        this.model.destroy({
            success: function () {
                alert('Asset deleted successfully');
                window.history.back();
            }
        });
        return false;
    },


    dragoverHandler: function (event) {
        var e = event.originalEvent;
        //event.stopPropagation();
        //event.preventDefault();
        e.stopPropagation();
        e.preventDefault();
        console.log('dragoverHandler:assetdetails');
    },

    dropHandler: function (event) {
        var e = event.originalEvent;
        //event.stopPropagation();
        //event.preventDefault();
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        $('#uplprogressbar').css({'width':'0%'});
        console.log('dropHandler:assetdetails');

        //Read the image file from the local file system and display it in the img tag

        //this.pictureFile = e.dataTransfer.files[0];
        //var reader = new FileReader();
        //reader.onloadend = function () {
        //   $('#picture').attr('src', reader.result);
        //};
        //reader.readAsDataURL(this.pictureFile);

        this.uploadingfiles = e.dataTransfer.files;
        var folder = '/prj/' + (this.model.id || 'calendar');
        var assetid = this.model.id || ''
        //alert('a ver...');

         //Use FormData to send the files
        var formData = new FormData();

         //append the files to the formData object
         //if you are using multiple attribute you would loop through 
         //but for this example i will skip that
        formData.append('loadfiles', this.uploadingfiles[0]);
        formData.append('folder',folder);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/files');
        xhr.onload = function() {
            var srvresponse = JSON.parse(xhr.responseText);
            var filelink = '<a href="'+srvresponse.urlpath+'" >'+srvresponse.uploaded+'</a>'
            console.log(xhr.responseText);
            $('#uplprogressbar').css({'width':'100%'});
            $('#uploaded').html(filelink);
            // create new asset-entry
            var as = {
                name: srvresponse.uploaded,
                slug: srvresponse.uploaded,
                denom: srvresponse.uploaded,
                uri: srvresponse.urlpath,
                mime: srvresponse.mime,
                type: srvresponse.type,
                size: srvresponse.size,
                lastModifiedDate: srvresponse.lastModifiedDate,
                related:{asset: assetid}
            };
            console.log('creating new asset');
            var asset = new Asset(as);
            asset.save(null, {
                success: function (model) {
                  console.log('Success new asset!');
                },
                error: function () {
                    utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
               }
            });
            console.log('asset created');
        };
        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                    var complete = (event.loaded / event.total * 100 | 0);
                    //updates a <progress> tag to show upload progress
                    $('#uplprogressbar').css({'width':complete+'%'});
            }
        };
        xhr.send(formData);
    },



});