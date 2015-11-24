module MarvelWidget {
    export class MarvelWidgetData {
        title: string;
        /**
         * Content to display: you can either provide it directly, or specify a URL, in which case it will replace the content.
         */
        content: string;
        url: string;
        /**
         * The actual content is being converted, if necessary, and set to the markdown text.
         */
        mdText: string;
        /**
         * If provided, indicates the feature type that needs to be selected in order to show the widget.
         */
        featureTypeName: string;
        /**
         * If provided, a list of properties that need to be injected into the content in order to generate the mdText.
         */
        dynamicProperties: string[];
    }

    export interface IMarvelWidgetScope extends ng.IScope {
        vm: MarvelWidgetCtrl;
        data: MarvelWidgetData;
        minimized: boolean;
    }

    export class MarvelWidgetCtrl {
        private scope: IMarvelWidgetScope;
        private widget: csComp.Services.IWidget;
        private parentWidget: JQuery;

        public static $inject = [
            '$scope',
            '$timeout',
            'layerService',
            'messageBusService',
            'mapService'
        ];

        constructor(
            private $scope: IMarvelWidgetScope,
            private $timeout: ng.ITimeoutService,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private $mapService: csComp.Services.MapService
            ) {
            $scope.vm = this;
            var par = <any>$scope.$parent;
            this.widget = par.widget;
            this.parentWidget = $("#" + this.widget.elementId).parent();

            $scope.data = <MarvelWidgetData>this.widget.data;
            $scope.data.mdText = $scope.data.content;
            $scope.minimized = false;

            if (typeof $scope.data.featureTypeName !== 'undefined' && typeof $scope.data.dynamicProperties !== 'undefined' && $scope.data.dynamicProperties.length > 0) {
                // Hide widget
                this.parentWidget.hide();
                this.$messageBus.subscribe('feature', (action: string, feature: csComp.Services.IFeature) => {
                    switch (action) {
                        case 'onFeatureDeselect':
                        case 'onFeatureSelect':
                            this.selectFeature(feature);
                            break;
                        default:
                            break;
                    }
                });
            }

            if (typeof $scope.data.url === 'undefined') return;
            $.get($scope.data.url, (md) => {
                $timeout(() => {
                    $scope.data.content = $scope.data.mdText = md;
                    $scope.data.title = 'Marvel test';
                    var w = $("#" + this.widget.elementId);
                    Marvelous.model($scope.data.mdText, 'Test', w);
                }, 0);
            });
        }

        private minimize() {
            this.$scope.minimized = !this.$scope.minimized;
            if (this.$scope.minimized) {
                this.parentWidget.css("height", "30px");
            } else {
                this.parentWidget.css("height", this.widget.height);
            }
        }

        private close() {
            this.parentWidget.hide();
        }

        private escapeRegExp(str: string) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        private replaceAll(str: string, find: string, replace: string) {
            return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        }

        private selectFeature(feature: csComp.Services.IFeature) {
            if (!feature || !feature.isSelected || feature.featureTypeName !== this.$scope.data.featureTypeName) {
                this.parentWidget.hide();
                return;
            }
            this.$timeout(() => {
                var md = this.$scope.data.content;
                var i = 0;
                this.$scope.data.dynamicProperties.forEach(p => {
                    var searchPattern = '{{' + i++ + '}}';
                    var displayText = '';
                    if (feature.properties.hasOwnProperty(p)) {
                        var pt = this.$layerService.getPropertyType(feature, p);
                        displayText = csComp.Helpers.convertPropertyInfo(pt, feature.properties[p]);
                    }
                    md = this.replaceAll(md, searchPattern, displayText);
                });
                this.parentWidget.show();
                this.$scope.data.mdText = md;
            }, 0);
        }
    }

}