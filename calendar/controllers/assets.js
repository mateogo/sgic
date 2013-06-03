/*
 *  calentdar assets.js
 *  package: /calendar/controllers
 *  DOC: Cada 'activo' es recurso / activo / que fue subido al server
 *       puede ser un file de cualquier tipo y estar asociado a un proyecto
 *       o recurso.
 *        
 *  Use:
 *     Exporta el objeto controller de un activo via 'exports'
 *     metodos exportados:
 *          open(); findById; findAll; add(), update(); delete()
 */
var dbi ;
var BSON;
var config = {};
var assetsCol = 'assets';
var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];
exports.setDb = function(db) {
    dbi = db;
    return this;
};
exports.setBSON = function(bs) {
    BSON = bs;
    return this;
};
exports.setConfig = function(conf){
    config = conf;
    return this;
},

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('assets:findById  Retrieving %s id:[%s]', assetsCol,id);
    dbi.collection(assetsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.find = function(req, res) {
    console.log('assets: find:');
    var query = req.body; //{};
    dbi.collection(assetsCol, function(err, collection) {
        //ojo: sort
        collection.find(query).sort({name:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};


exports.findAll = function(req, res) {
    console.log('findAll: Retrieving all instances of [%s] collection', assetsCol);
    dbi.collection(assetsCol, function(err, collection) {
        //ojo: sort
        collection.find().sort({name:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    var asset = req.body;
    var query = {};
    query.name  = asset.name;

    //paso-add-1.01: verifico si ya existe un asset con la misma URI
    dbi.collection(assetsCol, function(err, collection) {
        collection.find(query).toArray(function(err, items) {
            if(items.length>0){
                updateNode(req,res, items,asset);
            }else{
                createNode(req,res, items,asset);
            }
        });
    });
}

var createNode = function(req,res, items,asset) {
    console.log('createNode:assets.js insert new node');
    dbi.collection(assetsCol, function(err, collection) {
        collection.insert(asset, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('ADD: se inserto correctamente el nodo %s', JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

var updateNode = function(req,res, items,newasset) {
    var asset = items[0];
    var id = asset._id;
    asset.versions.push(newasset.fileversion);

    dbi.collection(assetsCol, function(err, collection) {
        collection.update({'_id':asset._id}, asset, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',assetsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(asset);
            }
        });
    });
}

exports.update = function(req, res) {
    var id = req.params.id;
    var asset = req.body;
    delete asset._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(asset));
    dbi.collection(assetsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, asset, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',assetsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(asset);
            }
        });
    });
}

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(assetsCol, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, function(err, result) {
            if (err) {
                res.send({error: MSGS[1] + err});
            } else {
                console.log('DELETE: se eliminaron exitosamente [%s] nodos',result);
                res.send(req.body);
            }
        });
    });
}

