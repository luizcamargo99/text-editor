angular.module('app').controller('EditorController', ['$scope', '$http',  function($scope, $http) {

    const URL_API = 'https://localhost:44324/Synonym?word=';
    const REGEX_COMMAS = /[,]/g;
    const REGEX_SPACE = /\&nbsp;/g;
    const MIN_SUGGESTIONS = 0;
    const MAX_SUGGESTIONS = 10;
    const CLASS_MARK = 'yellow';
    const ID_TEXT_EDITOR = 'text-editor';
  
    $scope.Initialize = function() {
        $scope.CurrentYear = new Date().getFullYear();
        $scope.Alerts = [];
        $scope.Suggestions = [];
        $scope.Words = [];  
        $scope.AlertIndex = {
          'word': 0,
          'times': 1,
          'isMarked': 2
        };    
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
                    data[ind][$scope.AlertIndex.times]++;
                } else {
                    map.set(val, data.push([val, $scope.AlertIndex.times]) - 1, 2);
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
            url: URL_API + wordKey
        }).then(function successCallback(response) {
  
            const suggestion = {
                'word': response.data.word,
                'synonyms': response.data.errorMessage == null 
                ? (response.data.synonymsList.length > MAX_SUGGESTIONS  
                  ?  $scope.NewArrayByIndexes(response.data.synonymsList, MIN_SUGGESTIONS, MAX_SUGGESTIONS) 
                  : response.data.synonymsList)
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
    
  
    $scope.PrepareMark = function (word, isMarked) {
      const textEditor = document.getElementById(ID_TEXT_EDITOR);
      const instance = new Mark(textEditor);
      $scope.Alerts.find(x => x[$scope.AlertIndex.word] == word)[$scope.AlertIndex.isMarked] = !isMarked;
      const hasMarked = $scope.Alerts.some(x => x[$scope.AlertIndex.isMarked] == true);
      textEditor.contentEditable = hasMarked ?  false : true;       
      instance.unmark();
      $scope.MarkWords(instance);
    }
  
    $scope.MarkWords = function (instance) {
      for (let index = 0; index <  $scope.Alerts.filter(x => x[$scope.AlertIndex.isMarked] == true).length; index++) {
          const elementWord =  $scope.Alerts.filter(x => x[$scope.AlertIndex.isMarked] == true)[index][$scope.AlertIndex.word];
          instance.mark(elementWord, {
              seperateWordSearch: false,
              className: CLASS_MARK,
           });        
      }
    }
    $scope.Initialize();
  }]);