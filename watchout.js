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
  bestScore: 0  
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

//////////////////////////////
//     Setup the Player     //
//////////////////////////////

var createPlayer = function() {
  return [
    {
      id: 101,
      x: 50,
      y: 50
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
    .attr('r', 10)
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

    return function(t) {
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
      .duration(1000)
      .tween('custom', tweenFn);
};

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

  gameTurn();
  setInterval(gameTurn, 1000);

};

play();


