var game_canvas = document.getElementById('game')
        var game_ctx = game_canvas.getContext('2d');
        function character (_x, _y, _color, _direction, _current_speed){
            this.height = 10;
            this.width = 10;
            this.color = _color;
            this.x = _x;
            this.y = _y;
            this.n_speed = 0;
            this.t_speed = 10;
            this.current_speed = _current_speed;
            this.jump_acc = -2;
            this.max_jump = 100;
            this.original_y = this.y;
            this.jump = false;
            this.fall = false;
            this.height_to_reach = this.original_y - this.max_jump;
            this.big = false;
            this.slow_down = false;
            this.direction = _direction;
        }
        
        var player = new character(game_canvas.width/2, game_canvas.height - 20, 'purple', 'still', 0);
        
        var enemies = [new character(game_canvas.width/2 - 89, game_canvas.height - 170 - 10, 'red', 'right', 2),
                       new character(game_canvas.width/2 + 100 + 74, game_canvas.height-100-10, 'yellow', 'left', 2),
                       new character(game_canvas.width * (3/4) + game_canvas.width/4 - 1, game_canvas.height/2 - 10, 'orange', 'left', 2)
                      ];
                
        var platforms = [[0, player.original_y+player.height, game_canvas.width], 
                         [game_canvas.width/2 - 50, game_canvas.height-50, 100],  
                         [game_canvas.width/2 + 100, game_canvas.height - 100, 75], 
                         [game_canvas.width/2 - 90, game_canvas.height - 170, 50], 
                         [game_canvas.width * (3/4) - 10, game_canvas.height/2, game_canvas.width/4 + 10]];
        
        var walls = [[0, 0, game_canvas.height], 
                    [game_canvas.width -10, game_canvas.height/2, game_canvas.height/2],
                    [game_canvas.width/2-50, game_canvas.height - 60, 10],
                    [game_canvas.width/2 + 39, game_canvas.height - 60, 10]];

        
        function drawPlayer(){
            game_ctx.beginPath();
            game_ctx.arc(player.x, player.y, player.height, 0, Math.PI * 2);
            game_ctx.fillStyle = player.color;
            game_ctx.fill();
            game_ctx.stroke();
            game_ctx.closePath(); 
        }
        
        function drawEnemy(){
            for(var i = 0; i < enemies.length; i++){
                game_ctx.beginPath();
                game_ctx.arc(enemies[i].x, enemies[i].y, enemies[i].height, 0, Math.PI * 2);
                game_ctx.fillStyle = enemies[i].color;
                game_ctx.fill();
                game_ctx.stroke();
                game_ctx.closePath();   
            }
        }
        
        function drawPlatform(_x,_y, _width){
            game_ctx.beginPath();
            game_ctx.rect(_x, _y, _width, 10);
            game_ctx.fillStyle = 'black';
            game_ctx.fill();
            game_ctx.closePath();
        }
        
        function drawWall(_x, _y, _height){
            game_ctx.beginPath();
            game_ctx.rect(_x, _y, player.t_speed + 1, _height);
            game_ctx.fillStyle = 'black';
            game_ctx.fill();
            game_ctx.closePath();
        }
                       
        function checkPlatforms(_character, _x, _y){
            var new_platform = platforms.filter(function(x){
                return (x[0] < _x) && (_x < (x[0] + x[2])) && (_y < x[1])
            });
            
            var highest;
            
            for(var i = 0; i < new_platform.length; i++){
                if(!highest){ highest = i}
                if(new_platform[i][1] < new_platform[highest][1]){
                    highest = i
                }
            }
            
            if(new_platform.length == 0){
                _character.original_y = platforms[0][1] - _character.height;
            } else {
                _character.original_y = new_platform[highest][1]-_character.height;
            }
        }
        
        function checkWalls(_character){
            for(var i = 0; i < walls.length; i++){
                if(walls[i][0] + 11 >= _character.x && walls[i][0] <= _character.x  && walls[i][1] <= _character.y  && _character.y <= walls[i][1] + walls[i][2]){
                    if(_character.direction == 'left'){
                        _character.x = walls[i][0] + _character.t_speed + 1  + _character.t_speed;
                        _character.direction = 'right'
                    } else if(_character.direction == 'right') {
                        _character.x = walls[i][0] - _character.t_speed  - 1;
                        _character.direction = 'left'
                    }
                }
            }
        }
        
        function enemy2EnemyCollision(_enemyIndex){
            var otherEnemies = enemies.slice(0, _enemyIndex)
                .concat(enemies.slice(_enemyIndex+1, enemies.length))
                .filter(function(x){return x.y == enemies[_enemyIndex].y})
                .filter(function(x){return enemies[_enemyIndex].x < x.x + x.height && enemies[_enemyIndex].x > x.x});

            if(otherEnemies.length != 0){
                otherEnemies.map(function(x){
                    if(x.direction == 'left'){
                        x.direction = 'right';
                        x.x += 2;  
                    } else {
                        x.direction = 'left';
                        x.x -= 2;
                    }    
                })
                
                if(enemies[_enemyIndex].direction == 'left'){
                    enemies[_enemyIndex].direction = 'right';
                    enemies[_enemyIndex].x += 2;  
                } else {
                    enemies[_enemyIndex].direction = 'left';
                    enemies[_enemyIndex].x -= 2;
                }
                
            }
        }
        
        function player2EnemyCollision(){
            if(player.fall || player.jump){
                
                var dead = enemies.filter(function(x){
                    return ((player.x > x.x - x.width) && (player.x < x.x + x.width) && (player.y + player.height > x.y - x.height) && (player.y + player.height < x.y + x.height))
                });
                enemies = enemies.filter(function(x){
                    return !((player.x > x.x - x.width) && (player.x < x.x + x.width) && (player.y + player.height > x.y - x.height) && (player.y + player.height < x.y + x.height))
                });
                
                console.log(dead)
            }
        }
        
        document.addEventListener('keydown', keyDownHandler, false);
        document.addEventListener('keyup', keyUpHandler, false);
        
        function keyDownHandler(e){
            if(e.keyCode == 37){
                player.slow_down = false;
                player.direction = 'left';
//                player.x -= player.current_speed;
                if(player.current_speed <= player.t_speed){
                    player.current_speed += 1;
                }
            } else if (e.keyCode == 39){
                player.slow_down = false;
                player.direction = 'right';
//                player.x += player.current_speed;
                if(player.current_speed <= 10){
                    player.current_speed += 1;
                }
            } else if (e.keyCode == 38){
                if(!player.jump){
                    player.jump = true;
                    player.jump_to_reach = player.original_y - player.max_jump;    
                }                
            } else if(e.keyCode == 40){
                if(!player.big){
                    player.big = true;
                    player.y -= player.height;
                    player.height *=2;
                } else {
                    player.big = false;
                    player.height /= 2;
                }
            }
        }
        
        function keyUpHandler(e){
            if(e.keyCode == 39 || e.keyCode == 37){
                player.slow_down = true;
                player.current_speed = player.n_speed;
            }
        }
        
        function jump(){
            if(player.jump == true){
                player.y += player.jump_acc;
                if(player.y <= player.jump_to_reach){
                    player.jump_acc = 5;
                } else if(player.y >= player.original_y && player.jump_acc == 5){
                    player.jump_acc = -1;
                    player.jump = false;
                } 
            }
        }
        
        function horizontal_movement(_character, _direction, _slow_down){
            if(_slow_down){
                if(_character.current_speed > _character.n_speed){
                    _character.current_speed -= 1;
                }  
                
                if (_character.current_speed == _character.n_speed){
                    _character.direction = 'still'
                }
            }
            
            if(_direction == 'left'){
                _character.x -= _character.current_speed;
            } else if (_direction == 'right') {
                _character.x += _character.current_speed;
            } 
        }
        
        function slow_down(){
            if(player.slow_down){
                if(player.current_speed > player.n_speed){
                    player.current_speed -= 1;
                } else {
                    player.slow_down = false;
                }
            }
        }
        
        function enemyMovement(_enemy){
            checkWalls(_enemy);
            checkPlatforms(_enemy, _enemy.x, _enemy.y);
            fall(_enemy);
            horizontal_movement(_enemy, _enemy.direction, _enemy.slow_down);
        }
        
        function fall(_character){
            if(!_character.jump && (_character.y != _character.original_y)){
                _character.y += 5;
                _character.fall = true;
            } else {
                _character.fall = false;
            }
        }
        
        function draw(){
            game_ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
            for(var i = 0; i < enemies.length; i++){
                enemy2EnemyCollision(i);
                enemyMovement(enemies[i])
            }
            player2EnemyCollision();
            checkWalls(player);
            checkPlatforms(player, player.x, player.y);
            horizontal_movement(player, player.direction, player.slow_down);
            fall(player);
            jump();
            for(var i = 0; i<platforms.length; i++){
                drawPlatform(platforms[i][0], platforms[i][1], platforms[i][2]);
            }
            for(var i = 0; i<walls.length; i++){
                drawWall(walls[i][0], walls[i][1], walls[i][2]);
            }
            drawPlayer();
            drawEnemy();
            requestAnimationFrame(draw);
        }
        
        draw();
