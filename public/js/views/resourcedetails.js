window.ResourceView = Backbone.View.extend({
    /**
     *  Constructor en main.js:
     *        new ResourceView({{model: resource})
     *
     */
    whoami:'ResourceView',

    initialize: function () {
        //alert('ResourceView: project:['+ this.project.denom+']');
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"            : "change",
        "show #quoteViewer" : "showquote",
        "hide #quoteViewer" : "hidequote",
        "click .save"       : "beforeSave",
        "click .delete"     : "deleteNode",
        "click .clonar"     : "clone",
        "click .browse"     : "browse",
        "drop #picture"     : "dropHandler"
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
        utils.showAlert('Success!', 'name:['+target.name+'] value:['+target.value+'] key:['+target.id+']', 'alert-success');

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
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
        this.saveNode();
        return false;
    },

    saveNode: function () {
        var self = this;
        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('recursos/' + model.id, false);
                utils.showAlert('Success!', 'Node saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    deleteNode: function () {
        this.model.destroy({
            success: function () {
                alert('Node deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    clone: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        app.navigate('recursos/add', false);
        this.model.unset('id',{ silent : true });
        this.model.unset('_id',{ silent : true });
        this.saveNode();
        return false;
    },

    browse: function () {
        //utils.resourcesQueryData().setProject(this.model.get('project')._id,this.model.get('denom'));
        utils.approuter.navigate('navegar/recursos', true);
        return false;
    },

    showquote: function () {
        $('#quotecallback').html(new ResourceQuoteView({model: this.model}).el);
        utils.editor.render('nicpanel','quotetext',this.model.get('quote'));
        //return false;
    },

    hidequote: function(){
        this.model.set({quote:utils.editor.getContent('quotetext')});
    },
 

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    }

});