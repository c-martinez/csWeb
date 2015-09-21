import ApiManager = require('./ApiManager');
import express = require('express')
import cors = require('cors')
import Layer = ApiManager.Layer;
import Feature = ApiManager.Feature;
import Logs = ApiManager.Log;
import BaseConnector = require('./BaseConnector');
import CallbackResult = ApiManager.CallbackResult;
import ApiResult = ApiManager.ApiResult;
import ApiMeta = ApiManager.ApiMeta;

export class RestAPI extends BaseConnector.BaseConnector {

    public manager: ApiManager.ApiManager;
    public resourceUrl;
    public layersUrl;
    public keysUrl;

    constructor(public server: express.Express, public baseUrl: string = "/api") {
        super();
        this.isInterface = true;
        this.resourceUrl = baseUrl + "/resources/";
        this.layersUrl = baseUrl + "/layers/";
        this.keysUrl = baseUrl + "/keys/";
    }

    public init(layerManager: ApiManager.ApiManager, options: any) {
        this.manager = layerManager;
        console.log('Init Rest API on port ' + this.server.get('port') + '. Base path is ' + this.layersUrl);

        //enables cors, used for external swagger requests
        this.server.use(cors());

        this.server.get(this.resourceUrl, (req: express.Request, res: express.Response) => {
            res.send(JSON.stringify(this.manager.resources));
        });

        this.server.post(this.resourceUrl + ":resourceId", (req: express.Request, res: express.Response) => {
            this.manager.updateResource(req.params.resourceId, req.body);
        });

        this.server.get(this.layersUrl, (req: express.Request, res: express.Response) => {
            res.send(JSON.stringify(this.manager.layers));
        });

        //------ layer API paths, in CRUD order

        // Or post to a layer collection that should be shielded-off (e.g. system or users)
        // And what if an agent starts sending gibberish?
        this.server.post(this.layersUrl, (req: express.Request, res: express.Response) => {
            var layer = new Layer();
            //layer.features = req.body.features;
            layer = req.body;
            this.manager.addLayer(layer, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                res.status(result.result).send(result);
            });
        })

        // gets the entire layer, which is stored as a single collection
        // TODO: what to do when this gets really big? Offer a promise?
        this.server.get(this.layersUrl + ':layerId', (req: any, res: any) => {
            this.manager.getLayer(req.params.layerId, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                if (result.result === ApiResult.OK)
                    res.send(result.layer);
            });
        })

        //Updates EVERY feature in the layer.
        this.server.put(this.layersUrl + ':layerId', (req: any, res: any) => {
            this.manager.updateLayer(req.params.layerId, req.body, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        })

        // gets the entire layer, which is stored as a single collection
        // TODO: what to do when this gets really big? Offer a promise?
        this.server.delete(this.layersUrl + ':layerId', (req: any, res: any) => {
            this.manager.deleteLayer(req.params.layerId, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        })

        //------ feature API paths, in CRUD order

        //adds a feature
        this.server.post(this.layersUrl + ":layerId/feature", (req: express.Request, res: express.Response) => {
            this.manager.addFeature(req.params.layerId, req.body, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        //returns a feature
        this.server.get(this.layersUrl + ":layerId/feature/:featureId", (req: express.Request, res: express.Response) => {
            this.manager.getFeature(req.params.layerId, req.params.featureId, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // updates a feature corresponding to a query on ID (should be one)
        // Takes a feature as input in the body of the PUT request
        this.server.put(this.layersUrl + ":layerId/feature", (req: express.Request, res: express.Response) => {
            var feature = new Feature();
            feature = req.body;
            this.manager.updateFeature(req.params.layerId, feature, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // for some reason (TS?) express doesn't work with del as http verb
        // unlike the JS version, which simply uses del as a keyword.
        // deletes a feature
        this.server.delete(this.layersUrl + ":layerId/feature/:featureId", (req: express.Request, res: express.Response) => {
            this.manager.deleteFeature(req.params.layerId, req.params.featureId, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // LOGS

        // addLog
        this.server.put(this.layersUrl + ":layerId/:featureId/log", (req: express.Request, res: express.Response) => {
            this.manager.addLog(req.params.layerId, req.params.featureId, req.body.prop, req.body, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                console.log("received log");
                res.send(result);
            });
        });

        //getLog (path doesnt make sense)
        this.server.get(this.layersUrl + ":layerId/:featureId/log", (req: express.Request, res: express.Response) => {
            this.manager.getLog(req.params.layerId, req.params.featureId, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        //deleteLog
        this.server.delete(this.layersUrl + ":layerId/:featureId/log", (req: express.Request, res: express.Response) => {
            this.manager.deleteLog(req.params.layerId, req.params.featureId, req.body.ts, req.body.prop, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // updates all features corresponding to query on ID (should be one)
        this.server.put(this.layersUrl + ":layerId/:featureId/logs", (req: express.Request, res: express.Response) => {
            var logs: { [key: string]: Logs[] };
            logs = req.body;
            this.manager.updateLogs(req.params.layerId, req.params.featureId, logs, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // Some geospatial queries that are only supported for mongo.
        // We chose to work with GET and params here for ease of accessibility
        // (majority of web APIs implement similar constructions)

        // gets all points in a rectangular shape.
        this.server.get(this.layersUrl + ":layerId/bbox", (req: express.Request, res: express.Response) => {
            var southWest: number[] = [Number(req.query.swlng), Number(req.query.swlat)];
            var northEast: number[] = [Number(req.query.nelng), Number(req.query.nelat)];
            this.manager.getBBox(req.params.layerId, southWest, northEast, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });

        // fetches all points in a spherical method
        this.server.get(this.layersUrl + ":layerId/getsphere", (req: express.Request, res: express.Response) => {
            this.manager.getSphere(req.params.layerId, Number(req.query.maxDistance), Number(req.query.lng), Number(req.query.lat), <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                // this.server.post(this.sensorsUrl + ":sensorId", (req: express.Request, res: express.Response) => {
                //     this.manager.addSensor(req.body, (result: CallbackResult) => { res.send(result) });
                // });
                //todo: check error
                res.send(result);
            });
        });

        //works with post - so we can receive a GeoJSON as input
        this.server.post(this.layersUrl + ":layerId/getwithinpolygon", (req: express.Request, res: express.Response) => {
            var feature: Feature = req.body;
            // this.server.get(this.sensorsUrl, (req: express.Request, res: express.Response) => {
            //     this.manager.getSensors((result: CallbackResult) => { res.send(result) });
            // });
            this.manager.getWithinPolygon(req.params.layerId, feature, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });


        //adds a feature
        this.server.post(this.keysUrl + ":keyId", (req: express.Request, res: express.Response) => {
            this.manager.updateKey(req.params.keyId, req.body, <ApiMeta>{ source: 'rest' }, (result: CallbackResult) => {
                //todo: check error
                res.send(result);
            });
        });


    }

}