angular.module('app').controller('EditorController', ['$scope', '$http', function($scope, $http) {

  const url_api = 'https://localhost:44324/Synonym?word=';

  $scope.Initialize = function() {
      $scope.CurrentYear = new Date().getFullYear();
      $scope.Alerts = [];
      $scope.Suggestions = [];
      $scope.Words = [];
  }

  $scope.CheckText = function() {
      const textWithoutCommas = $scope.TextEditor.replace(/[,]/g, '');
      $scope.Words = textWithoutCommas.split(/\s+/g);

      $scope.CreateAlerts = arr => {
          return arr.reduce((acc, val) => {
              const {
                  data,
                  map
              } = acc;
              const ind = map.get(val);
              if (map.has(val)) {
                  data[ind][1]++;
              } else {
                  map.set(val, data.push([val, 1]) - 1);
              }
              return {
                  data,
                  map
              };
          }, {
              data: [],
              map: new Map()
          }).data;
      };

      $scope.Alerts = $scope.CreateAlerts($scope.Words);
  }

  $scope.RequestSuggestions = function(wordKey) {

      if ($scope.Loading) {
          return;
      }

      $scope.Loading = true;

      $http({
          method: 'GET',
          url: url_api + wordKey[0]
      }).then(function successCallback(response) {

          const suggestion = {
              'word': response.data.word,
              'suggestions': response.data.errorMessage == null 
              ? response.data.synonymsList 
              : response.data.errorMessage
          };

          $scope.Suggestions.push(suggestion);
          $scope.Loading = false;

      }, function errorCallback() {
          $scope.ShowErrorRequest = true;
      });
  }

  $scope.CheckButtonSuggestionVisibility = function(word) {
      return $scope.Suggestions.some(x => x.word == word) == false;
  }

  $scope.ChangeWordBySuggestion = function() {

  }

  $scope.Initialize();
}]);