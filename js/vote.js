vote = function(voteCode, stars){
  console.log(voteCode, stars);
  var FB_URL = 'https://itdp-brt-map.firebaseio.com';

  var fb = new Firebase(FB_URL + '/' + voteCode + '/' + stars);
  fb.transaction(function(currentVal){
    isFinite(currentVal) || (currentVal = 0);
    return currentVal+1;
  }, function(){
    document.getElementById(voteCode + '_votemsg').style.display = 'inline';
  });
};