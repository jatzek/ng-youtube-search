/**
 * Created by jacek on 22.02.16.
 */


(function ( angular ) {

    angular
        .module('netgenes.ng-youtube-search',['ng'])
        .provider('youtubeSearch', function youtubeSearchProvider() {

            var key;
            var defaultParams;
            var apiEndpoint;

            defaultParams = {
                part: 'snippet',
                type: 'video',
                maxResults: 10,
                order : 'rating'
            };

            apiEndpoint = 'https://www.googleapis.com/youtube/v3/search';

            this.setKey = function setKey( providedKey ) {

                key = providedKey;
            };

            this.setDefaultsParams = function setDefaultParams( params ) {

                if (angular.isObject( params) ) {

                    angular.extend( defaultParams, params );
                }
            };

            this.$get = function youtubeSearchFactory( $http ) {

                if ('undefined' === typeof key) {

                    throw new Error('youtubeSearch service isn\'t setup properly. Please setup api key using youtubeSearchProvider.setKey( key )');
                }

                function YoutubeVideo( item ) {

                    var apiEndpoint = 'https://www.googleapis.com/youtube/v3/videos';
                    var self = this;

                    this.v = item;

                    this.f = null;

                    this.getFileDetails = function getFileDetails( ) {

                        var params = { key : key, part: 'contentDetails', id : this.v.id.videoId };


                        $http.get( apiEndpoint, { params: params } ).then(function ( responseObject ) {

                            self.f = responseObject.data.items[0];
                        });
                    }
                }


                function search( query, extraParams ) {

                    return new Promise( function ( resolve, reject ) {

                        var params;
                        params = angular.extend( { key : key, q: query }, defaultParams, extraParams || {} );

                        $http.get(apiEndpoint,{ params:params }).then(function( responseObject ) {

                            var items = responseObject.data.items;

                            var videos = [];

                            if ( items && items.length ) {

                                angular.forEach( items , function( item) {

                                    videos.push(new YoutubeVideo( item ));
                                });
                            }

                            resolve(videos);

                        }, reject);
                    });
                }

                return search;

            };
        })
        .constant('extractYtId', function( url ) {

            var pattern = /v\=([^&]+)/;

            if (!pattern.test(url)) {
                return null;
            }

            return pattern.exec(url)[1];
        })
        .factory('ytBrowserToEmbed', function( extractYtId ) {

            return function( url ) {

                var id;
                id = extractYtId(url);

                return '//www.youtube.com/embed/' + id;
            }

        })
        .filter('ytTimeFormat', function() {

            return function(value) {

                if (!value) {
                    return '-';
                }

                var hours, minutes, fMinutes, seconds, fSeconds, hRx, mRx, sRx, parts;

                parts = [];
                hRx = /(\d+)H/;
                mRx = /(\d+)M/;
                sRx = /(\d+)S/;
                if (hRx.test(value))
                {
                    hours = hRx.exec(value)[1];
                    parts.push(hours);
                }
                minutes = mRx.exec(value) ? mRx.exec(value)[1] : '0';
                fMinutes = hours ? ('0'+minutes).slice( -2 ) : minutes;
                parts.push(fMinutes);
                seconds = sRx.exec(value) ? sRx.exec(value)[1] : '00';
                fSeconds = ('00'+seconds).slice(-2);
                parts.push(fSeconds);


                return parts.join(':');

            }
        });

})( window.angular );