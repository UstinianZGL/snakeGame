var sw = 20,  //格子的宽度
    sh = 20,  //格子的高度
    tr = 30,  //行 -- 格子数
    td = 30;  //列 -- 格子数

var snake = null;  //蛇的实例
var food = null;   //食物的实例
var game = null;   //游戏的实例

function Square(x,y,classname){     //用来创建方格
    this.x = sw * x;
    this.y = sh * y;
    this.class = classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;

    this.parent = document.querySelector('#snakeWarp');

}

Square.prototype.create = function(){   //将方块DOM插入到页面正确的位置上
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw +  'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.viewContent.style.left = this.x + 'px';

    this.parent.appendChild(this.viewContent);
}

Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
}


//贪吃蛇
function Snake(){
    this.head = null;  //记录蛇头信息
    this.tail = null;  //记录蛇尾信息
    this.pos = [];   // 存储蛇身上每个方格的位置信息

    this.directionNum = { //存储蛇走的方向，用一个对象表示
        left:{
            x : -1,
            y : 0,
            rotate : 180
        },
        right:{
            x : 1,
            y : 0,
            rotate : 0
        },
        up:{
            x : 0,
            y : -1,
            rotate: -90
        },
        down:{
            x : 0,
            y : 1,
            rotate : 90
        }

    }
}

Snake.prototype.init = function(){
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    snakeHead.viewContent.style.transform = 'rotate(0deg)'
    this.head = snakeHead;  //存储蛇头的位置
    this.pos.push([2,0]);  //把蛇头的位置存储起来

    //创建蛇身
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);

    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.pos.push([0,0]);
    this.tail = snakeBody2;

    //创建链表关系
    this.head.last = null;
    this.head.next = snakeBody1;

    snakeBody1.last = this.head;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right; //默认让蛇往右走
}


//获取蛇头的下一个位置的对应的元素位置，根据元素位置的不同做不同的事情
Snake.prototype.getNextHeadPos = function(){
    var nextPos = [
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]
    // console.log(nextPos);
    var flag = false;
    //下一个点是自己，表示蛇撞到了自己的身体，游戏结束
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            flag = true;
        }
    })
    if(flag){
        console.log('撞到自己啦');
        this.strategies.gameOver.call(this);
        return ;
    }
    //下一个点是围墙，游戏结束
    if(nextPos[0] < 0 || nextPos[0] >= td || nextPos[1] < 0 || nextPos[1] >= tr){
        flag = true;
        console.log('撞到墙啦！');
        this.strategies.gameOver.call(this);
        return ;
    }
    //下一个点是食物，吃掉它
    if(food && nextPos[0] == food.x / sw && nextPos[1] == food.y / sh){
        this.strategies.eat.call(this);
    }
    //下一个点什么都不是，接着走
    // console.log('接着走');
    this.strategies.move.call(this);
    
}

//蛇移动后需要做的事情
Snake.prototype.strategies = {
    eat : function(){
        console.log('eat apple!!');
        this.strategies.move.call(this,true);
        createFood();
        game.score++;
    },
    move : function(isEat){
        //创建一个新的蛇身体去替代之前蛇头的位置
        var newBody = new Square(this.head.x / sw,this.head.y / sh,'snakeBody');
    
        //更新链表里的信息
        this.head.next.last = newBody;
        newBody.next = this.head.last;
        newBody.last = null;

        newBody.create();
        this.head.remove();  //将原来的蛇头的位置用新的身体节点代替
        
        //创建新的蛇头
        var newHead = new Square(this.head.x / sw + this.direction.x,this.head.y / sh + this.direction.y,'snakeHead');
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)'
        //更新链表信息
        newBody.last = newHead;
        newHead.next = newBody;
        newHead.last = null;

        newHead.create();
        this.head = newHead; //将其更新为新的蛇头

        if(!isEat){   //该情况不是蛇吃到苹果的情况，删去尾结点，并更新新的尾结点的值
           this.tail.remove();
           this.tail = this.tail.last; 
           this.pos.pop();
        }

        //更新蛇身上的位置信息
        this.pos.unshift([this.head.x / sw,this.head.y / sh]);
        // console.log(this.pos);
    },
    gameOver : function(){
        console.log('gameOver');
        game.over();
    }
}

//创建食物
function createFood(){
    var x = null,
        y = null;
    //随机生成一个位置，该位置不能是蛇的身体上的
    var flag = true;
    while(flag){
        var x = Math.round(Math.random()*(tr - 1));
        var y = Math.round(Math.random()*(td - 1));
        snake.pos.forEach(function(value){
            if(value[0] != x && value[1] != y){
                flag = false;
            }
        })
    }
    food = new Square(x,y,'food');
    var foodDom = document.querySelector('.food');
    if(foodDom){
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    }else{
        food.create();
    }
}
  

snake = new Snake();
// snake.init();
// snake.getNextHeadPos();
// createFood();


//创建游戏操作
function Game(){
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function(){
    snake.init();
    createFood();
    document.onkeydown = function(eve){
        if(eve.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(eve.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }else if(eve.which == 37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left
        }else if(eve.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }
    }
    this.move();
}

Game.prototype.move = function(){
    this.timer = setInterval(function(){
        snake.getNextHeadPos();
    },200)
}

Game.prototype.over = function(){
    clearInterval(this.timer);
    alert('游戏结束，你的得分为：'+ this.score);

    //游戏回到最初的状态
    var snakeWarp = document.querySelector('#snakeWarp');
    snakeWarp.innerHTML = '';
    snake = new Snake();
    game = new Game();

    var startBody = document.querySelector('.start-body');
    startBody.style.display = 'block'

}

Game.prototype.pause = function(){
    clearInterval(this.timer);
    var pauseBody = document.querySelector('.pause-body');
    pauseBody.style.display = 'block';
}

game = new Game();
// game.init();

var startBtn = document.querySelector('.start');
var pauseBtn = document.querySelector('.pause');
var snakeWarp = document.querySelector('#snakeWarp');
startBtn.onclick = function(){
    console.log('haha');
    startBtn.parentNode.style.display = 'none';
    game.init();
}

snakeWarp.onclick = function(){
    console.log('点击了游戏,暂停一下');
    game.pause();
}

pauseBtn.onclick = function(){
    game.move();
    pauseBtn.parentNode.style.display = 'none';
}
