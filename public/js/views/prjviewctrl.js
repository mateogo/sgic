window.projectview = function(id){
    console.log('projectview:prjviewctrl.js [%s]',id);
    
    utils.prjmodel = {};
    utils.prjmodel.project = new Project({_id: id});
    //utils.prjmodel.quotation = new Quotation();

    var prjHeaderView = new PrjHeaderView({model:utils.prjmodel.project});
    $('#prjheader').html(prjHeaderView.el);
    
    utils.prjmodel.project.fetch({success: projectviewsuccess}); 
};

var projectviewsuccess = function(prj){
    console.log('projectviewsuccess [%s]',prj.get('slug'))
    utils.resourcesQueryData().setProject(prj.id,prj.get('denom'));
    utils.quotationsQueryData().setProject(prj.id,prj.get('denom'));
    resourceview();
    assetsview();
};

window.resourceview = function(){
    console.log('resourceview:prjviewctrl.js ');
    var query = utils.resourcesQueryData().retrieveData(),
        resourceList = new ResourceCollection();
    
    $('#reslist').html('');
    resourceList.fetch({
        data: query,
        type: 'post',
        success: function(resourceList) {
            if(resourceList.length>0){
                //$('#reslist').append('<h3>recursos</h3>');
                resourceList.each(resourceviewsuccess);   
            }
        }
    });
};

var resourceviewsuccess = function(res){
    console.log('resourceviewsuccess: [%s]',res.get('slug'));

    var reqResListView = new ResourceListItemView({model:res,tagName:'div'});
    $('#reslist').append(reqResListView.render().el);  

    var reqResDetailView = new ReqResDetailView({model:res});
    $('#reslist').append(reqResDetailView.render().el);
};

window.assetsview = function(){
    console.log('assetsview:prjviewctrl.js [' + utils.resourcesQueryData().getProject()+']');
    var query = {related: {project: utils.resourcesQueryData().getProjectId()}},
        assetList = new AssetCollection();

    assetList.fetch({
        data: query,
        type: 'post',
        success: function(assetList) {
            if(assetList.length>0){
                $('#assets').append('<h4>archivos</h4>');
                assetList.each(assetviewsuccess);   
            }
        }
    });
};

var assetviewsuccess = function(asset){
    console.log('assetviewsuccess: [%s]',asset.get('slug'));

    var assetListItemView = new AssetListItemView({model:asset,tagName:'div'});
    $('#assets').append(assetListItemView.render().el);  
};
    

var quotationsuccess = function(quo){
    utils.reqmodel.project.set({_id: quo.get('project')._id});
    utils.reqmodel.project.fetch({success: projectsuccess});

    var resourcesid = quo.get('resources');
    var resources = [];
    for (var i =0; i<resourcesid.length; i++){
        var res = new Resource({_id: resourcesid[i]}).fetch({success: resourcesuccess});
        resources.push(res);

    }
    utils.reqmodel.resources = resources;
};


window.PrjHeaderView = Backbone.View.extend({

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
        //this.listenTo(this.project,"change", this.render);
    },

    render: function () {
        //alert(JSON.stringify(this.model.toJSON()));
        $(this.el).html(this.template({prj: this.model.toJSON()}));
        return this;
    },
});

window.ReqResListView = Backbone.View.extend({

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {

        //alert(JSON.stringify(this.model.toJSON()));
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
});

window.AssetListItemView = Backbone.View.extend({

    events: {
        "change"            : "change",
    },

    initialize: function () {
        //this.listenTo(this.model, "change", this.render);
        this.model.bind("change", this.render, this);
        //this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    
    change: function(event){
        this.model.set(event.target.name,event.target.value);
        this.model.save(null, {
            success: function (model) {
                utils.showAlert('Success!', 'Node saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    }
});


window.ReqResDetailView = Backbone.View.extend({
    tagName:'div',
    className:'span10',

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {

        //alert(JSON.stringify(this.model.toJSON()));
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
});

window.ProjectViewLayout = Backbone.View.extend({

    whoami:'ProjectViewLayout',

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "click .addresources" : "addResources",
        "click .addquotation" : "addQuotation",
        "click .browsequotations" : "browseQuotations",
        "change"           : "change"
    },

    change: function (event) {
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        resourceview();
    },

    addQuotation: function () {
        //utils.quotationsQueryData().setProject(this.model.id,this.model.get('denom'));
  
        utils.approuter.navigate('requisitorias/add', true);
        return false;
    },

    browseQuotations: function () {
        //utils.quotationsQueryData().setProject(this.model.id,this.model.get('denom'));
        utils.approuter.navigate('navegar/requisitorias', true);
        return false;
    },

    addResources: function () {
        //utils.resourcesQueryData().setProject(this.model.id,this.model.get('denom'));
        utils.approuter.navigate('recursos/add', true);
        return false;
    },

});