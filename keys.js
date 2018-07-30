var app = angular.module("appX", ['ngSanitize']);
app.controller("appCtrl", function($scope, $sanitize, $http, $q) {
  
  $scope.origem = 0;

  $scope.init = function() {
    this.apiKey = localStorage.getItem('ApiKey');
    if (this.apiKey) {
      this.countKeys = 0;
      this.countDiffKeys = 0;
      this.comando = 0;
      $scope.countGameKeys();
      $scope.countDiffGameKeys();
       if (!localStorage.getItem('gamesmap')) {
         $scope.loadGames();
       }
    }
  }

  $scope.parse = function() {
    switch(parseInt($scope.origem)) {
      case 1: 
        $scope.parseBundlestar();
        break;
      case 2: 
        $scope.parseGogobundle();
        break;
      case 3:
        $scope.parseRemoveKeys();
	      break;
      case 4:
        $scope.parseRemoveDescs();
	      break;
      case 5:
	      $scope.keysRepeats();
	      break; 
      case 6:
        $scope.descRepeats();
        break;
      case 7:
        $scope.addGamesDB();
        break;
      case 8:
        $scope.addGamesKeys();
        break;
      case 9:
        $scope.findGamesKeysDB();
        this.comando = 9;
        break;
      case 10:
        $scope.listRandomGamesKeysDB();
        this.comando = 10;
        break;
      case 11:
        $scope.generateReedemCode();
        this.comando = 11;
        break;
      case 12:
        $scope.findKeysDB();
        this.comando = 12;
        break;
      case 13:
        $scope.listGreaterThanRandomGamesKeysDB();
        this.comando = 13;
        break;
      case 14:
        $scope.listRandomGamesKeysNotContainDB();
        this.commando = 14;
        break;
      case 15:
        $scope.generateConfirmText();
        this.comando = 15;
        break;
    }
  }

  $scope.habilitaDeleteKeys = function() {
    return this.comando == 9 || this.comando == 10 || this.comando == 12 ||
    this.comando == 13;
  }

  $scope.keysRepeats = function() {
    var arrTemp = [];
    var arrResult = [];
    var arr =  $scope.keystext.split('\n');
    for (var i in arr) {
      var linha = arr[i];
      var desc = arr[i].substr(linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      arrTemp.push(desc);
    }

    for (var i in arrTemp) {
      var item = $scope._getLinhaRepeat(i,arrTemp);
      if (item) {
	      arrResult.push(item);
      }
    }

   $scope.result = $sanitize(arrResult.join('\n'));
  }

  $scope.descRepeats = function() {
    var arrTemp = [];
    var arrResult = [];
    var arr =  $scope.keystext.split('\n');
    for (var i in arr) {
      var linha = arr[i];
      var desc = arr[i].substr(0, linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      arrTemp.push(desc);
    }

    for (var i in arrTemp) {
      var item = $scope._getLinhaRepeat(i,arrTemp);
      if (item) {
	      arrResult.push(item);
      }
    }

   $scope.result = $sanitize(arrResult.join('\n'));
  }

  $scope._getLinhaRepeat = function(index,arr) {
    for (var i in arr) {
      if (i != index && arr[i] == arr[index]) {
	      return "linha:"+i+" item:" + arr[i] + "\n";
      }
    }
    return undefined;
  }

  $scope.parseRemoveKeys = function() {
    var arrResult = [];
    var arr =  $scope.keystext.split('\n');
    arr =  $scope._removeKeys(arr);
    for (var i in arr) {
      arrResult.push(arr[i]);
    }
   $scope.result = $sanitize(arrResult.join('\n'));
  }

  $scope.parseRemoveDescs = function() {
    var arrResult = [];
    var arr =  $scope.keystext.split('\n');
    arr =  $scope._removeDesc(arr);
    for (var i in arr) {
      arrResult.push(arr[i]);
    }
   $scope.result = $sanitize(arrResult.join('\n'));
  }

  $scope._removeKeys = function(arr) {
    var arrResult = [];
    for (var i in arr) {
      var linha = arr[i];
      var desc = arr[i].substr(0,linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      arrResult.push(desc);
    }
    return arrResult;
  }

  $scope._removeDesc = function(arr) {
    var arrResult = [];
    for (var i in arr) {
      var linha = arr[i];
      var desc = arr[i].substr(linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      arrResult.push(desc);
    }
    return arrResult;
  }
  
  $scope.parseGogobundle = function() {
    var arr =  $scope.keystext.split('\n');
    var arrResult = [];
    var arrDesc = [];    
    var ret = [];

    for (var i in arr) {
      var linha = arr[i].substr(0,arr[i].search(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/g)).trim();
      var desc = linha.substr(0,linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      arrResult.push(linha);
    }

    var adicionados = []

    for (var i in arrResult) {
      if (adicionados.indexOf(arrResult[i]) == -1) {
        var desc = arrResult[i].substr(0,arrResult[i].search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
        var repeats = $scope.getGogoRepetidos(arrResult,desc);
        for (var j in repeats) {
          if (!ret[j]) {
            ret[j] = [];
          }
	        ret[j].push(repeats[j]);
	        adicionados.push(repeats[j]);
        }
      }
    }	
    
    var strRes = '';
    for (var i=0;i<ret.length;i++) {
      strRes += ret[i].join('\n') + '\n\n';
    }

    console.log(ret);
    $scope.result = $sanitize(strRes);
  }

  $scope.getGogoRepetidos = function(arr, desc) {
    var arrRes = [];
    for (var i in arr) {
      var descArr = arr[i].substr(0,arr[i].search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)).trim();
      if (desc == descArr) {
  	    arrRes.push(arr[i]);
      }
    }
   return arrRes;
  }

  $scope.parseBundlestar = function() {
    let arr =  $scope.keystext.split('\n');
    let arrFiltered = [];
    let result = "";
    for (let i=0;i<arr.length;i++) {
      let val = arr[i].trim();
      if (val && 
         val.indexOf('How Do I Redeem My Key?') < 0 && val.indexOf('example') < 0) {
        arrFiltered.push(val);
      }
    }

    console.log('arrFiltered',arrFiltered);

    for (let i=0;i<arrFiltered.length-1;i=i+2) {
      result += arrFiltered[i] + '  ' + arrFiltered[i+1] + '\n';
    }
   	
    $scope.result = $sanitize(result);
  }

  $scope.removeDuplicates = function(str) {
    str = str.split(/\s+/g);
    var result = [];
    for(var i =0; i < str.length ; i++){
      if(result.indexOf(str[i]) == -1) {
 	result.push(str[i]);
      }
    }
    result=result.join(" ");
    return result;
  }

  $scope.copyAll = function () {
    if (!navigator.clipboard) {
      $scope.fallbackCopyTextToClipboard($scope.result);
      return;
    }

    navigator.clipboard.writeText($scope.result).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  $scope.fallbackCopyTextToClipboard = function (text) {

    let target = document.getElementById('result');
    let range; 
    let selection;
    
    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(target);
      range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  }

  $scope.countGameKeys = function() {
    $scope.countGameKeysDB({active:true}).then(
      (data) => {
        console.log(data.data);
        this.countKeys = data.data;
      }
    );
  }

  $scope.countDiffGameKeys = function() {
  
    let query =  {description: { $exists: true}, active:true};

    $scope.listDistinctDB('randomkeysbox', 'gameskeys', 'description', query)
      .then((res)=>{
        console.log('res',res);
        this.countDiffKeys = res.data.values.length;
      },
      (error) => {
        console.log('error',error);
      }
    );
  }

  $scope.populaGameInfo = function(product) {

    let deferred = $q.defer();

    let currency = 'US';
    let urlInfo = 'https://store.steampowered.com/api/appdetails?appids='+ product.appId +'&cc=' + currency;
    
    $http({ method: 'GET',  url: urlInfo}).then(
      (info) => {
         let data = info.data[product.appId].data;
         product.description = data.name;
         product.priceUSD = (data.price_overview)?data.price_overview.initial:undefined;
         product.metacritic = (data.metacritic)?data.metacritic.score:undefined;
         
         currency = 'BRL';
         urlInfo = 'https://store.steampowered.com/api/appdetails?appids='+ product.appId +'&cc=' + currency;

         $http({ method: 'GET',  url: urlInfo}).then(
          (info) => {
             let data = info.data[product.appId].data;
             product.priceBRL = (data.price_overview)?data.price_overview.initial:undefined;
             deferred.resolve(product);
          },
          (error) => {
             deferred.reject(error);
          }
        );
      },
      (error) => {
         deferred.reject(error);
      }
    );

    return deferred.promise;
  }

  $scope.addGamesDB = function() {
    let arr =  $scope.keystext.split('\n');  
    let promises = [];

    for (let i in arr) {
      let linha = arr[i];
      let id = linha.trim();
      //let desc = linha.substr(linha.search(/[a-zA-Z]/g)).trim();
      let product = {appId:id, 
        description:undefined, 
        priceBRL:undefined, 
        priceUSD:undefined, 
        metacritic:undefined};
      
      promises.push($scope.populaGameInfo(product));
    }

    $q.all(promises).then((products) => {
      this.insert(products,'games').then(
        (data)=> {
          this.result = 'Insert Suceffull ' + data.data.n + ' inserted';
          this.keystext = '';
        }, 
        (data)=> this.result = "error:" + data);
    });
  }

  $scope.insert = function(games, dbname) {
    var req = {
      method: 'POST',
      url: 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/'+dbname+'?apiKey=' + this.apiKey,
      headers: {
        'Content-Type': "application/json"
      },
      data: JSON.stringify(games)
     }

     return $http(req);
  }

  $scope.addGamesKeys = function() {
    $scope.addGamesKeysDB().then(
      (data)=> {
        this.result = 'Insert Suceffull ' + data.data.n + ' inserted';
        this.keystext = '';
        $scope.countGameKeys();
      }, 
      (error)=> {
        this.result = "error:" + error;
      }
    );
  }

  $scope.populaGamesKeys = function(productKey) {
     let deferred = $q.defer();

     $scope.getGameTitleDB({description:productKey.description})
      .then((item)=>{
          if (item && item.data && item.data[0]){
            productKey.appId = item.data[0].appId;
            productKey.priceBRL = item.data[0].priceBRL;
            productKey.priceUSD = item.data[0].priceUSD;
            productKey.metacritic = item.data[0].metacritic;
          }
          deferred.resolve(productKey);
      }, (error) => {
        deferred.reject(error);
      }); 

      return deferred.promise;
  }

  $scope.addGamesKeysDB = function() {
    let deferred = $q.defer();
    let arr =  $scope.keystext.split('\n');
    let promisses = [];

    for (let i in arr) {
      let linha = arr[i];
      let regex = linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)
      let desc = linha.substr(0,regex).trim();
      let key = linha.substr(regex).trim();

      let productKey = {
        appId:undefined, 
        description:desc, 
        key:key,
        priceBRL:undefined,
        priceUSD:undefined, 
        active:true} 

      promisses.push($scope.populaGamesKeys(productKey)); 
    }

     $q.all(promisses).then((values) => {
        this.insert(values,'gameskeys').then(
          (data) => {
            deferred.resolve(data);
          },
          (error) => {
            deferred.reject(error);
          }
        );
     });

    return deferred.promise;
  }

  $scope.getDate = function() {
    let date = new Date();
    return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
     ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  }

  $scope.addShowListDB = function(list) {
    let showList = {date:$scope.getDate(),keys:list};
    return this.insert(showList,'showlist');
  }

  $scope.findGamesKeysDB = function() {
    let arr =  $scope.keystext.split('\n');
    let promises = [];

    for (let i in arr) {
      let linha = arr[i].trim();
      promises.push($scope.getGameKeysDB({description:linha, active:true}));
    }

    $scope.executeFindKeysPromisse(promises);
  }

  $scope.findGamesKeysNotContainDB = function() {
    let arr =  $scope.keystext.split('\n');
    let promises = [];
    let descriptions = [];

    for (let i in arr) {
      let linha = arr[i].trim();
      descriptions.push(linha);
    }

    let query =  {description: { $exists: true, $nin: descriptions }, active:true};
    
    $scope.getGameKeysDB(query).then(
      (item) => {

        let arrResult = [];
        for (let i in item.data) {
          arrResult.push(item.data[i].description + '  ' + item.data[i].key);
        }
        
        if (arrResult && arrResult.length > 0) {
          $scope.addShowListDB(arrResult);
        }
  
        this.result = '';
        for (let i in arrResult) {
          if (arrResult[i]) {
            this.result += arrResult[i] + "\n";
          }
        }
      }
    );
  }

  $scope.findKeysDB = function() {
    let arr =  $scope.keystext.split('\n');
    let promises = [];

    for (let i in arr) {
      let linha = arr[i].trim();
      promises.push($scope.getGameKeysDB({key:linha, active:true}));
    }

    $scope.executeFindKeysPromisse(promises);
  }

  $scope.executeFindKeysPromisse = function(promises) {
    $q.all(promises).then((values) => {
      let arrResult = values.map((item)=>{
        if (!item || !item.data || !item.data[0]) {
          return undefined;
        }
        return item.data[0].description + '  ' + item.data[0].key;
      }); 
      
      if (arrResult && arrResult.length > 0) {
        $scope.addShowListDB(arrResult);
      }

      this.result = '';
      for (let i in arrResult) {
        if (arrResult[i]) {
          this.result += arrResult[i] + "\n";
        }
      }
    });
  }

  $scope.listRandomGamesKeysDB = function() {
    let quantidade =  parseInt($scope.keystext.trim());
    let promises = [];
    
    $scope.listDistinctDB('randomkeysbox', 'gameskeys', 'description', {active:true})
      .then((res)=>{
        console.log('res',res);
        let arrResult = res.data.values;

        arrResult = $scope.shuffle(arrResult);
        let max = (quantidade > arrResult.length)?arrResult.length:quantidade;

        for (let i = 0;i < max; i++) {
          let description = arrResult[i].trim();
          promises.push($scope.getGameKeysDB({description:description, active:true}));
        }

        $scope.executeFindKeysPromisse(promises);
      },
      (error) => {
        console.log('error',error);
      }
    );
  }

  $scope.listRandomGamesKeysNotContainDB = function() {
    let arr =  $scope.keystext.split('\n');
    let promises = [];
    let descriptions = [];
    let quantidade = 0;

    for (let i in arr) {
      let linha = arr[i].trim();
      if (i == 0) {
        quantidade = parseInt(linha);
      }
      else {
        descriptions.push(linha);
      }
    }

    let query =  {description: { $exists: true, $nin: descriptions }, active:true};

    $scope.listDistinctDB('randomkeysbox', 'gameskeys', 'description', query)
      .then((res)=>{
        console.log('res',res);
        let arrResult = res.data.values;

        arrResult = $scope.shuffle(arrResult);
        let max = (quantidade > arrResult.length)?arrResult.length:quantidade;

        for (let i = 0;i < max; i++) {
          let description = arrResult[i].trim();
          promises.push($scope.getGameKeysDB({description:description, active:true}));
        }

        $scope.executeFindKeysPromisse(promises);
      },
      (error) => {
        console.log('error',error);
      }
    );
  }

  $scope.listGreaterThanRandomGamesKeysDB = function() {
    let arr = $scope.keystext.trim().split(':');
    let currency = arr[0].trim().toUpperCase();
    let quantidade = parseInt(arr[1].trim());
    let price = parseInt(arr[2].trim());
    let query = undefined;
    if (currency == 'BRL') {
      query = { priceBRL: { $gt: price }, active:true };
    }
    else if(currency == 'USD') {
      query = { priceUSD: { $gt: price }, active:true };
    }
    else {
      return;
    }

    let promises = [];
    
    $scope.listDistinctDB('randomkeysbox', 'gameskeys', 'description', query)
      .then((res)=>{
        console.log(res);
        let arrResult = res.data.values;
        console.log(arrResult);

        arrResult = $scope.shuffle(arrResult);
        let max = (quantidade > arrResult.length)?arrResult.length:quantidade;

        for (let i = 0;i < max; i++) {
          let description = arrResult[i].trim();
          promises.push($scope.getGameKeysDB({description:description, active:true}));
        }

        $scope.executeFindKeysPromisse(promises);
      }
    );
  }

  $scope.setObjLocal = function(key, obj) {
    localStorage.setItem(key,JSON.stringify(obj));
  }

  $scope.getObjLocal = function(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  $scope.loadGames = function() {
    console.log('load');
    let query = 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/games?apiKey=' + this.apiKey;
    
    $http({method: 'GET', url: query}).then(
      (values) => {
        let gamesmap = [];
        for (let index in values) {
          let obj = values[index];
          gamesmap[obj.description] = obj;
        }
        $scope.setObjLocal('gamesmap',gamesmap);
      } 
    );
  }

  $scope.getGameKeysDB = function(params, limit) {
    let strparams = JSON.stringify(params);
    let query = 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/gameskeys?q='+strparams;
    if (limit && limit > 0) {
      query += 'l=' + limit;
    }
    
    query += '&apiKey=' + this.apiKey;
    console.log(query);
    
    return $http({
      method: 'GET',
      url: query
    });
  }

   $scope.getGameTitleDB = function(params, limit) {
    let strparams = JSON.stringify(params);
    let query = 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/games?q='+strparams;
    if (limit && limit > 0) {
      query += 'l=' + limit;
    }
    
    query += '&apiKey=' + this.apiKey;
    console.log(query);
    
    return $http({
      method: 'GET',
      url: query
    });
  }

  $scope.countGameKeysDB = function(params) {
    let strparams = JSON.stringify(params);
    let query = 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/gameskeys?q='+strparams;
    query += '&c=true&apiKey=' + this.apiKey;
    
    return $http({
      method: 'GET',
      url: query
    });
  }

  $scope.listDistinctDB = function(dbname, colldistinct, fieldDistinct, params) {

    let command = JSON.stringify( {"distinct": colldistinct,"key": fieldDistinct,"query": params} );
    let url = 'https://api.mlab.com/api/1/databases/'+dbname+'/runCommand?apiKey=' + this.apiKey;
    console.log(url);
    console.log(command);

    var req = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': "application/json;charset=utf-8"
      },
      data: command,
      transformResponse:(data)=>{
        return (data)?JSON.parse(data.replace('<','"').replace('>','"')):data;
      }
     }

     return $http(req);
  }

  $scope.shuffle = function(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  $scope.desativarKeys = function() {
    if (!this.result) {
      this.result = 'Sem resultados para exclusão.';
      return;
    }

    let array = this.result.split(/\r|\n/);
    
    let promises = [];

    for (index in array) {
      let linha = array[index];
      if (linha && linha.trim().length > 0) {
        let regex = linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g);
        let key = linha.substr(regex).trim();
        promises.push($scope.desativarKey(key));
      }
    }

    $q.all(promises).then((values) => {
      let count = 0;
      for (index in values) {
        count += (values[index].status == 200)?1:0;
      }
      alert(count + ' Removidas');
    }); 
  }

  $scope.desativarKey = function(key) {
    let url = 'https://api.mlab.com/api/1/databases/randomkeysbox/collections/gameskeys?apiKey=' + this.apiKey + '&q={"key":"'+key+'"}';
    let req = {
      method: 'PUT',
      url: url,
      headers: {
        'Content-Type': "application/json"
      },
      data: JSON.stringify( { "$set" : { "active" : false } } )
     }

     return $http(req);
  }

  $scope.generateConfirmText = function() {
    this.result = 'To recive your keys.\n' + 
    'Go on your paypal registered email account\nand send email to: tiago.hablich@gmail.com' +
    '\nWith text: I confirm the order. \n\nThanks.';
  }

  $scope.generateReedemCode = function() {
    let arr =  $scope.keystext.split('\n');
    let arrKeys = [];
    let keysToDesactivate = [];

    for (let i in arr) {
      let linha = arr[i];
      let regex = linha.search(/[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}/g)
      let desc = linha.substr(0,regex).trim();
      let key = linha.substr(regex).trim();
      arrKeys.push(desc + '   ' + key);
      keysToDesactivate.push(key); 
    }

    let code = this.createReedemCode();

    let reedemcode = {
      code:code,
      date:$scope.getDate(),
      keys:arrKeys
    };
    this.insert(reedemcode,'reedemcodes')
      .then((data)=> {
        this.result = code;
      }, (data)=> this.result = "error:" + data);
  }


  $scope.createReedemCode = function() {
    let arrChars = ['a','b','c','d','e','f','g','h','i','j',
    'k','l','m','n','o','p','q','r','s','t','u','v','x','y','z',
    '1','2','3','4','5','6','7','8','9','0'];

    let code = '';

    for (let i=0;i < 7;i++) {
      let index = Math.floor(Math.random() * arrChars.length);
      let upperCase = Math.floor(Math.random() * 2);
      code += (upperCase == 1)? arrChars[index].toUpperCase():arrChars[index];
    }

    return code;
  }
  
  $scope.isAllow = function() {
    return localStorage.getItem('ApiKey');
  }

});
