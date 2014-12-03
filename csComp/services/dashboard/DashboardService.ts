﻿module csComp.Services {

    export class DashboardService {
        public maxBounds: IBoundingBox;
        public featureDashboard: csComp.Services.Dashboard;
        public mainDashboard: csComp.Services.Dashboard;        
        public editMode: boolean;
        public activeWidget: IWidget;
        public dashboards: any;

        public static $inject = [
            '$location',
            '$translate',
            'messageBusService'            
        ];

        
        public init(d: { [id: string]: csComp.Services.Dashboard }) {
            if (!d) {
                d = {};

            }            
            this.featureDashboard = new csComp.Services.Dashboard("feature", "feature");
              
        }

        constructor(
            private $location: ng.ILocationService,
            private $translate: ng.translate.ITranslateService,
            private $messageBusService: Services.MessageBusService,
            private $mapService: Services.MapService) {  
            //$translate('FILTER_INFO').then((translation) => console.log(translation));
            // NOTE EV: private props in constructor automatically become fields, so mb and map are superfluous.

            
            
            //this.dashboards["main"] = this.mainDashboard;


        }

        
    }

}