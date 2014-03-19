(function() {
  'use strict'
  function queryEditor() {
    return {
      restrict: 'E',
      scope: {
        'query': '=',
        'lock': '='
      },
      template: '<textarea\
                  ui-codemirror="editorOptions"\
                  ng-model="query.query">',
      link: function($scope) {
        $scope.editorOptions = {
            mode: 'text/x-sql',
            lineWrapping: true,
            lineNumbers: true,
            readOnly: false,
            matchBrackets: true,
            autoCloseBrackets: true
        };

        $scope.$watch('lock', function(locked) {
          $scope.editorOptions.readOnly = locked ? 'nocursor' : false;
        });
      }
    }
  }

  function queryFormatter($http) {
    return {
      restrict: 'E',
      scope: {
        'query': '=',
        'lock': '='
      },
      template: '<button type="button" class="btn btn-default btn-xs"\
                   ng-click="formatQuery()">\
                    <span class="glyphicon glyphicon-indent-left"></span>\
                     Format SQL\
                </button>',
      link: function($scope) {
        $scope.formatQuery = function formatQuery() {
            $scope.lock = true;
            $http.post('/api/queries/format', {
                'query': $scope.query.query
            }).success(function (response) {
                $scope.query.query = response;
            }).finally(function () {
              $scope.lock = false;
            });
        };
      }
    }
  }

  function queryRefreshSelect() {
    return {
      restrict: 'E',
      template: '<select\
                  ng-disabled="!isOwner"\
                  ng-model="query.ttl"\
                  ng-change="saveQuery()"\
                  ng-options="c.value as c.name for c in refreshOptions">\
                  </select>',
      link: function($scope) {
        $scope.refreshOptions = [
            {
                value: -1,
                name: 'No Refresh'
            },
            {
                value: 60,
                name: 'Every minute'
            },
        ]

        _.each(_.range(1, 13), function (i) {
            $scope.refreshOptions.push({
                value: i * 3600,
                name: 'Every ' + i + 'h'
            });
        })

        $scope.refreshOptions.push({
            value: 24 * 3600,
            name: 'Every 24h'
        });
        $scope.refreshOptions.push({
            value: 7 * 24 * 3600,
            name: 'Once a week'
        });
      }

    }
  }

  angular.module('redash.directives')
  .directive('queryRefreshSelect', queryRefreshSelect)
  .directive('queryEditor', queryEditor)
  .directive('queryFormatter', ['$http', queryFormatter]);
})();