//////////////////////////////
//  Setup the environment   //
//////////////////////////////

var gameSettings = {
  height: 450,
  width: 700,
  nEnemies: 30,
};

var gameStats = {
  score: 0,
  highScore: 0,
  collisions: 0,
  duration: 4000
};

//////////////////////////////
//     Setup the Board      //
//////////////////////////////
var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameSettings.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameSettings.height])
};

var gameBoard = d3.select('.container').append('svg:svg')
                  .attr('width', gameSettings.width)
                  .attr('height', gameSettings.height)
                  .style('background-color','lightgray');

var updateScore = function(){
  d3.select('.current span').text(gameStats.score.toString())
};

var updateHighScore = function(){
  gameStats.highScore = _.max([gameStats.highScore, gameStats.score]);
  d3.select('.high span').text(gameStats.highScore.toString());
};

//////////////////////////////
//     Setup the Player     //
//////////////////////////////

var createPlayer = function() {
  return [
    {
      id: 101,
      x: 50,
      y: 50,
      r: 10
    }
  ];
};


var renderPlayer = function(playerData) {

  var dragmove = function(d) {
    //debugger;
    d3.select('.player')
    .attr("cx", d.x = Math.max(0, Math.min(gameSettings.width, d3.event.x)))
    .attr("cy", d.y = Math.max(0, Math.min(gameSettings.height, d3.event.y)));
  };

  var drag = d3.behavior.drag()
    .on("drag", dragmove); 


  var player = gameBoard.selectAll('circle.player')
                        .data(playerData, function(d) {
                          return d.id;
                        });
  player.enter()
    .append('svg:circle')
    .attr('class', 'player')
    .attr('cx',  function(playa) {       
      return axes.x(playa.x); 
    })
    .attr('cy',  function(playa) {       
      return axes.y(playa.y); 
    })
    .attr('fill','brown')
    .attr('r', function(d){ return d.r})
    .call(drag);
};

//////////////////////////////
//         Enemies          //
//////////////////////////////

var createEnemies = function() {
  return _.range(0,gameSettings.nEnemies).map(function(i) {
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100
    };
  });
};

//////////////////////////////
//     Render the Board     //
//////////////////////////////

var render = function(enemyData) {
  var enemies = gameBoard.selectAll('circle.enemy')
                .data(enemyData, function(d) {
                  return d.id;
                });

  enemies.enter() 
    .append('svg:circle') 
    .attr('class', 'enemy')
    .attr('cx', function(enemy) {       
      return axes.x(enemy.x); 
    })
    .attr('cy', function(enemy) { 
      return axes.y(enemy.y); 
    })
    .attr('r', 10);

  enemies.exit() 
     .remove();

  //checkCollision probably should be moved outside render with some other functions
  var checkCollision = function(enemy, collidedCallback, prev){
    console.log("checkcollision");
    var player = d3.selectAll('.player');
    var radiusSum =  parseFloat(enemy.attr('r')) + parseFloat(player.attr('r'));
    var xDelta = parseFloat(enemy.attr('cx')) - parseFloat(player.attr('cx'));
    var yDelta = parseFloat(enemy.attr('cy')) - parseFloat(player.attr('cy'));
    var zDelta = Math.sqrt( Math.pow(xDelta,2) + Math.pow(yDelta,2) )
    if(prev != zDelta < radiusSum){
      collidedCallback(player, enemy)
    };
    return zDelta < radiusSum;
  };

  var tweenFn = function(endEnemyData) {
    var enemy = d3.select(this);
    var startPos = {
      x: parseFloat(enemy.attr('cx')),
      y: parseFloat(enemy.attr('cy'))
    };
    var endPos = {
      x: axes.x(endEnemyData.x),
      y: axes.y(endEnemyData.y)
    };
    var previousCollision = false;
    return function(t) {      
      previousCollision = checkCollision(enemy, onCollision, previousCollision);
      
      var enemyNextPos = {
        x: startPos.x + (endPos.x - startPos.x)*t,
        y: startPos.y + (endPos.y - startPos.y)*t
      };
      enemy.attr('cx', enemyNextPos.x)
        .attr('cy', enemyNextPos.y);
    };
  };

  enemies
    // .transition()
    //   .duration(500)
    //   .attr('r', 10)
    .transition() 
      .duration(gameStats.duration)
      .tween('custom', tweenFn);
};

var updateCollisions = function(){
  d3.select('.collisions').text(gameStats.collisions.toString());
};

var onCollision = function(){
  gameStats.collisions +=1;
  updateCollisions();
  updateHighScore();
  gameStats.score = 0;
  updateScore();
}


//////////////////////////////
//      Play the Game       //
//////////////////////////////

var play = function() {
  var gameTurn = function(){    
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
    var newPlayerPosition = createPlayer();
    renderPlayer(newPlayerPosition);
  };

  var increaseScore = function(){
    gameStats.score +=1;
    updateScore();
  }

  gameTurn();
  setInterval(gameTurn, gameStats.duration);
  setInterval(increaseScore, 50*(1000/gameStats.duration));

};

play();


