var app = angular.module('Trombinoscope',[])

app.controller('SearchController',function($scope, $http, $q){
	// Ce tableau permet de regrouper tous les utilisateurs retrouves
	$scope.results = [];

	// Le user qui a été selectionné pour avoir plus d'infos par rapport a lui
	$scope.userSelected = null;

	$scope.userSelect = function(user) {
		$scope.userSelected = user;
	}

	// Function d'erreur appellé lors de ne différents appels en cas d'echecs
	$scope.errorCallback = function(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		console.log(response.status)
			switch (response.status){
				case -1 : 
					alert("ATTENTION ! \nVeuillez enlever vos restrictions Cross-Origin pour utiliser ce site");
					break;
				// Code retour 300-399 : Redirection de la requête client
				case 300: 
					alert("ERREUR 300 :\n L’URI demandée se rapporte à plusieurs ressources.");
					break;
				case 301: 
					alert("ERREUR 301 :\n Document déplacé de façon permanente.");
					break;
				case 302: 
					alert("ERREUR 302 :\n Document déplacé de façon temporaire.");
					break;

				// Code retour 400-499 : Requête client incomplète
				case 400: 
					alert("ERREUR 400 :\n syntaxe de la requete erronée.");
					break;
				case 401: 
					alert("ERREUR 401 :\n authentification requise pour exécuter la requête.");
					break;
				case 403: 
					alert("ERREUR 403 :\n Pas d'authorisation pour exécuter la requête.");
					break;
				case 408: 
					alert("ERREUR 408 :\n Temps d’attente d’une réponse du serveur écoulé.");
					break;

				// Code retour 500-599 : Erreur serveur
				case 500:
					alert("ERREUR 500 :\n Erreur interne du serveur")
					break;

				case 503:
					alert("ERREUR 503 :\n Le service est temporairement indisponible ou en maintenance")

				default: 
					alert("ERREUR :\n Veuillez réessayer ultérieurement");
					break;
			}
	};

	// Function appelée lors d'une recherche que ce soit par structure ou par personne
	$scope.researchTrombi = function() {
		// Si on fait une recherche par individu alors on vérifie que le nom ou le prénom ont été renseignés :
		if($scope.lastName == "" && $scope.firstName == "" && $scope.currentTab == 0) {
			alert("ATTENTION ! \nVous devez au moins spécifier un nom ou un prénom ...");
		// Si on fait une recherche par structure, on vérifie que la structure est non vide :	
		} else if ($scope.structureObjectSelected == null  && $scope.currentTab == 1) {
			alert("ATTENTION ! \nVous devez au moins spécifier une structure ...");
		// Si le formulaire est correctement rempli, on fait notre appel
		} else {

			var myUrl = "";
			if ($scope.currentTab == 0) {
				myUrl = 'https://webapplis.utc.fr/Trombi_ws/mytrombi/result?nom='+$scope.lastName+'&prenom='+$scope.firstName
			} else {
				myUrl = 'https://webapplis.utc.fr/Trombi_ws/mytrombi/resultstruct?pere='+$scope.structureObjectSelected.structure.structId+'&fils='
				
				if ($scope.sousStructureNameSelected != ""){
					$scope.sousStructureObjectSelected = JSON.parse($scope.sousStructureNameSelected);
					myUrl += $scope.sousStructureObjectSelected.structure.structId;
				} else {
					myUrl += 0;
				}
			}
			
			$http({
				url: myUrl,
				method: 'GET',
				withCredentials: true,
	        	headers: {
	                'Content-Type': 'application/json; charset=utf-8'
	        	}
			}).then(function successCallback(response) {
				// this callback will be called asynchronously
				// when the response is available
				$scope.results = response.data;
				angular.forEach($scope.results, function(user) {
					if(user.autorisation == "O"){
						user.image ='https://demeter.utc.fr/portal/pls/portal30/portal30.get_photo_utilisateur_mini?username='+user.login;
					}
				});
			}, function errorCallback(response) {
				$scope.errorCallback(response);
			});

		}

		
		
	};


	// ========= Pour le tab menu avec choix entre struct et personne =======
	// On commence par individu
	$scope.currentTab = 0;

	// OnClickTab permet de changer entre struct et personne
    $scope.onClickTab = function (index) {
    	// Reinitialisation des variables
        $scope.currentTab = index;
        $scope.userSelected = {};
        $scope.firstName = "";
		$scope.lastName = "";
		$scope.sousStructures =[];
		$scope.structureNameSelected = "";
		$scope.structureObjectSelected = null;
		$scope.sousStructureNameSelected = "";
		$scope.sousStructureObjectSelected = {};
		$scope.results = [];
    }
    
    // Booléen pour savoir quelle tab est active
    $scope.isActiveTab = function(index) {
        return index == $scope.currentTab;
    }


    // =========== Tab Personne =========
    // Variable gardant le nom et le prénom de la personne recherchée
	$scope.firstName = "";
	$scope.lastName = "";


	// =========== Tab Structure ========
	$scope.structures = [];
	
	$scope.sousStructures =[];

	// Fonction permettant de récupérer les différentes structures
	$scope.researchStructure = function() {
		$http({
			url:'https://webapplis.utc.fr/Trombi_ws/mytrombi/structpere',
			method: 'GET',
			withCredentials: true,
        	headers: {
                'Content-Type': 'application/json; charset=utf-8'
        	}

		}).then(function successCallback(response){
			$scope.structures = response.data;
		}, function errorCallback(response){
			$scope.errorCallback(response);
		})
	}

	// Variables permettant de savoir la structure selectionnée
	$scope.structureNameSelected = "";
	$scope.structureObjectSelected = {};

	// Fonction permettant de récupérer les sous-structures de l'élément sélectionné
	$scope.callSousStructure = function() {
		$scope.structureObjectSelected = JSON.parse($scope.structureNameSelected);
		$http({
			url:'https://webapplis.utc.fr/Trombi_ws/mytrombi/structfils?lid='+$scope.structureObjectSelected.structure.structId,
			method: 'GET',
			withCredentials: true,
        	headers: {
                'Content-Type': 'application/json; charset=utf-8'
        	}

		}).then(function successCallback(response){
			$scope.sousStructures = response.data;
			console.log($scope.sousStructures);

		}, function errorCallback(response){
			$scope.errorCallback(response);
		})
	};

	// Variables permettant de savoir la sous-structure selectionnée 
	$scope.sousStructureNameSelected = "";
	$scope.sousStructureObjectSelected = {};

	// Initialisation :
	// On lance au chargement de la page le 1er appel pour pouvoir récupérer les structures
	$scope.researchStructure();
})
