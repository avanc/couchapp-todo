
module.exports = function($scope, TicklerWatch, Configuration) {
    TicklerWatch.update();
    $scope.OfflineUsage=Configuration.local.get("OfflineUsage");
    
    Configuration.global.get("DefaultMarkupLanguage").then(function(value) {
        $scope.defaultMarkupLanguage=value;
    });
    
    
    $scope.updateOfflineUsage = function() {
        Configuration.local.put("OfflineUsage", $scope.OfflineUsage);
    };
    
    $scope.updateMarkupLanguage = function() {
        console.log($scope.defaultMarkupLanguage);
        Configuration.global.put("DefaultMarkupLanguage", $scope.defaultMarkupLanguage);
    };
    
};

module.exports.$inject = ['$scope', 'TicklerWatch', 'Configuration'];