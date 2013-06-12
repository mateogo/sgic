window.Quotation = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/requisitorias",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
 
        this.validators.fesolstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };

        this.validators.fenecstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    getResourceList: function(){
        //project:{_id : this.model.id} }
        return this.get('resources');
    },

    setResourceList: function(rlist){
        this.set({resources:rlist});
    },

    defaults: {
        _id: null,
        project:{},
 
        slug: "",

        nro: '',
        fesol: "",
        fenec: "",
        fesolstr: "",
        fenecstr: "",

        solname: "",
        soldata: "",

        provname: "",
        provdata: "",

        gencond: "",
        partcond: "",

        rubro: "",
        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",

        resources: []
    }

});

window.QuotationCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Quotation,

    url: "/navegar/requisitorias"

});

window.BrowseQuotationsQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.Project = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/proyectos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

        this.validators.artista = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un artista"};
        };
 
        this.validators.eventdatestr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },
 

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        as.related = {project:this.id};

        console.log('prjmodel:creating new asset');
        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('prjmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
        console.log('asset created');
    },

    assetFolder: function(){
        return '/prj/' + (this.id || 'calendar');
    },

    defaults: {
        _id: null,
        denom: "",
        slug: "",
        genero: "musica",
        isPropio: 1,
        isAireLibre: 0,
        tvx: "no_definido",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "medio",
        responsable: "",
        artista: "",
        city: "CABA",
        eventdatestr: "31/05/2013",
        eventdate: new Date().getTime(),
        description: "",
        picture: null,
        duracion:''
    }
});


window.ProjectCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Project,

    url: "/navegar/proyectos"

});


window.BrowseProjectsQuery = Backbone.Model.extend({
    // ******************* BROWSE PROJECT QUERY ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },

    defaults: {
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.BrowseResourcesQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.Resource = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/recursos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        console.log('resmodel:creating new asset: '+this.get('project')['_id']);
        as.related = { project: this.get('project')['_id'], resource: this.id};

        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('resmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
        console.log('asset created');
    },

    assetFolder: function(){
        return '/res/' + (this.id || 'calendar');
    },




    defaults: {
        _id: null,
        denom: "",
        slug: "",
        rubro: "tecnica",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "medio",
        responsable: "",
        contraparte: "",
        description: "",
        fenecesidad: "",
        quote: "",
        project:{},
        picture: null,
        freq:1,
        qty:1,
        ume:'UN'
    }
});

window.ResourceCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Resource,
    initialize: function (model, options) {
        if(options) this.options = options;
    },
    url: "/navegar/recursos"

});

window.Asset = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/activos",

    idAttribute: "_id",

<<<<<<< HEAD
=======
    project:null,

   initialize: function () {
        this.validators = {};

      
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },








    getProjectName: function(){
        // todo: instanciar un project 
        // if(!this.project){
        //      var prjid = this.get("related").project;
        //      if(!prjid) return "no definido";
        //      this.project = new Project ({_id:prjid});
        //}
        // return project.getDenom();
        // todo: agregar el metodo getDenom en project
        // pedirle al project su nombre
    },

>>>>>>> 458c91b1f3adae06b6b9d8f66b2fba56aa66d0ab
    defaults: {
        _id: null,
        name: "",
        slug: "",
        denom: "",
        urlpath:"",
        versions:[],
        related:{}
    }
});

window.AssetCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Asset,
    initialize: function (model, options) {
       if(options) this.options = options;
    },

    url: "/recuperar/activos"

});

/*
eq: {
    "domain":null,
    "_events":{},
    "_maxListeners":10,
    "size":36456,
    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
    "name":"danzas-circulares.jpg",
    "type":"image/jpeg",
    "hash":false,
    "lastModifiedDate":"2013-05-24T17:25:39.393Z","
    _writeStream":{ "_writableState":{
                        "highWaterMark":16384,
                        "objectMode":false,
                        "needDrain":true,
                        "ending":true,
                        "ended":true,
                        "finished":true,
                        "decodeStrings":true,
                        "length":0,
                        "writing":false,
                        "sync":false,
                        "bufferProcessing":false,
                        "writecb":null,
                        "writelen":0,
                        "buffer":[]
                    },
                    "writable":true,
                    "domain":null,
                    "_events":{},
                    "_maxListeners":10,
                    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
                    "fd":null,
                    "flags":"w",
                    "mode":438,
                    "bytesWritten":36456,
                    "closed":true
                },
    "length":36456,
    "filename":"danzas-circulares.jpg",
    "mime":"image/jpeg"
}
*/
