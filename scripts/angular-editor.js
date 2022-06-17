angular.module('app').controller('EditorController', ['$scope', '$http',  function($scope, $http) {

  const URL_API = 'https://localhost:44324/Synonym?word=';
  const REGEX_COMMAS = /[,]/g;
  const REGEX_SPACE = /\&nbsp;/g;

  $scope.Initialize = function() {
      $scope.CurrentYear = new Date().getFullYear();
      $scope.Alerts = [];
      $scope.Suggestions = [];
      $scope.Words = [];  
  }

  $scope.CheckText = function() {
      const textWithoutCommas =  $scope.TextHTML.replace(REGEX_COMMAS, '');
      $scope.TextEditor = textWithoutCommas.replace(REGEX_SPACE, '')
      $scope.Words = $scope.TextEditor.toLowerCase().split(/\s+/g);
      $scope.AlertsAux = $scope.Alerts;

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
                  map.set(val, data.push([val, 1]) - 1, 2);
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
      $scope.Alerts.forEach(element => {
        element[4] =  $scope.AlertsAux.find(y => y[0] == element[0])[4];
        $scope.MarkWords(element[0], !element[4]);
      });
  }

  $scope.RequestSuggestions = function(wordKey) {

      if ($scope.Loading) {
          return;
      }

      $scope.Loading = true;

      $http({
          method: 'GET',
          url: URL_API + wordKey
      }).then(function successCallback(response) {

          const suggestion = {
              'word': response.data.word,
              'synonyms': response.data.errorMessage == null 
              ? (response.data.synonymsList.length > 10  ?  $scope.NewArrayByIndexes(response.data.synonymsList,0, 10) : response.data.synonymsList)
              : [response.data.errorMessage]
          };

          $scope.Suggestions.push(suggestion);
          $scope.Loading = false;

      }, function errorCallback() {
          $scope.ShowErrorRequest = true;
      });
  }

  $scope.NewArrayByIndexes = function (array, startIndex, endIndex) {
    let newArray = []; 
    array.slice([startIndex], [endIndex]).map((item) => {
      newArray.push(item);
    });
    return newArray;
  }

  $scope.CheckButtonSuggestionVisibility = function(word) {
      return $scope.Suggestions.some(x => x.word == word) == false;
  }

  $scope.ChangeWordBySuggestion = function(synonym, word) {
    $scope.TextHTML =  $scope.TextHTML.replace(word, synonym);
    $scope.CheckText();
  }
  

  $scope.MarkWords = function (word, isMarked) {
    const instance = new Mark(document.querySelector('div#text-editor'));
    $scope.Alerts.find(x => x[0] == word)[4] = !isMarked;
    const hasMarked = $scope.Alerts.some(x => x[4] == true);
    document.getElementById('text-editor').contentEditable = hasMarked ?  false : true;   
    
    if (isMarked) {
        instance.unmark();
    }

    for (let index = 0; index <  $scope.Alerts.filter(x => x[4] == true).length; index++) {
        const element =  $scope.Alerts.filter(x => x[4] == true)[index][0];
        instance.mark(element, {
            seperateWordSearch: false,
            className: "yellow",
         });        
    }
  }

  $scope.Initialize();
}]);