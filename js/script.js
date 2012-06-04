/* Author:

*/

var engine;

$(document).ready(function() {
    
    var player_score = 0, cpu_score = 0;
    
    var mousey = 0, mousey_last = 0;
    var playervy = 0;
    
    var ballx = 10, bally = 10;
    var velocity = 5;
    var ballvx = 1 * velocity, ballvy = (Math.random() * 2 - 1) * velocity;
    
    var cpuy = 100;
    var proportional = 0.8, integral = 0.24, derivative = 0.24;
    var cpuspeed = 5;
    
    var paddle_height = 150, paddle_width = 15;
    var speed_increase = 1.04;
    
    function reset_game() {
        ballx = engine.getWidth() * 0.5, bally = engine.getHeight() * 0.5;
        ballvx = 1 * velocity, ballvy = (Math.random() * 2 - 1) * velocity;
    }
    
    engine = new jsge.Engine("stage", {
        init: function() {
            
            // Set up events
            $(this.canvas).mousemove(function (event) {
                if(!engine.paused) {
                    var thisPosX = $(this).position().left;
                    var thisPosY = $(this).position().top;
                
                    mousey_last = mousey;
                    mousey = thisPosY - event.clientY;
                }
            });
            
            $(this.canvas).click(function(event) {
                engine.paused = false;
            });
            
            key('esc', function() {
                engine.paused = !engine.paused;
            });
            
            // Set up audio
            this.blip = new Audio("audio/blip.wav");
            this.blip.volume = 0.8;
            
            this.explosion = new Audio("audio/explosion.wav");
            this.explosion.volume = 0.8;
            
            this.bounce = new Audio("audio/bounce.wav");
            this.bounce.volume = 0.8;
            
            // Set up display
            this.ctx.font = "19pt Monospace";
            
            this.paused = true;
            
            // Set up sprites
            bally = Math.random() * this.getHeight();
            ballx = this.getWidth() * 0.5;
        },
        
        main: function() {
            // Partially clear screen for a CRO style scan-line look
            this.ctx.fillStyle = "rgba(0,0,0,0.35)";
            //this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
            this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
            
            this.ctx.fillStyle = "#3dff0c";
            
            if(!this.paused) {
                playervy = mousey - mousey_last; 
            
                // Update ball
                ballx += ballvx, bally += ballvy;
            
                // Bounce off ceiling and floor
                if(bally <= 0) {
                    ballvy = Math.abs(ballvy);
                    this.bounce.play();
                } else if(bally >= this.getHeight()) {
                    ballvy = -Math.abs(ballvy);
                    this.bounce.play();
                }
            
                // Bounce off players
                if(ballx <= paddle_width) {
                    if(Math.abs(this.getHeight() - mousey - bally) < paddle_height * 0.75) {
                        ballvx = Math.abs(ballvx) * speed_increase;
                        ballx += paddle_width;
                        ballvy -= playervy * 0.09;
                    
                        this.blip.play();
                    } else {
                        // Player dropped the ball
                        this.explosion.play();
                        cpu_score++;
                        reset_game();
                    }
                }
            
                if(ballx >= this.getWidth() - paddle_width) {
                    if(Math.abs(cpuy - bally) < paddle_height * 0.5) {
                        ballvx = -Math.abs(ballvx) * speed_increase;
                        ballx -= paddle_width;
                        this.blip.play();
                    } else {
                        // CPU dropped the ball
                        this.explosion.play();
                        player_score++;
                        reset_game();
                    }
                }
            
                // Update CPU
                var p = (bally - cpuy) * proportional;
                var i = 0;
                var d = 0;
                var cpuvy = 0 + p + i + d;
            
                // Cap CPU speed
                if(cpuvy < 0) {
                    cpuvy = Math.max(-cpuspeed, cpuvy);
                } else {
                    cpuvy = Math.min(cpuspeed, cpuvy);
                }
            
                cpuy += cpuvy;
            } else {
                this.ctx.textAlign = "center";
                this.ctx.fillText("Paused. <Click to resume>", this.getWidth() * 0.5, this.getHeight() - 10);
            }
            
            // Draw player
            this.ctx.fillRect(0, this.getHeight() - mousey - paddle_height * 0.5, paddle_width, paddle_height);
            
            // Draw CPU
            this.ctx.fillRect(this.getWidth() - paddle_width, cpuy - paddle_height * 0.5, paddle_width, paddle_height);
            
            // Draw ball
            this.ctx.fillRect(ballx - 7.5, bally - 7.5, 15, 15);
            
            // Draw scores
            this.ctx.textAlign = "left";
            this.ctx.fillText("Player:" + player_score, 20, 30);
            this.ctx.textAlign = "right";
            this.ctx.fillText("CPU:" + cpu_score, this.getWidth() - 40, 30);
        },
        
        exit: function() {
            log("End");
        }
    });

    engine.start();

});
