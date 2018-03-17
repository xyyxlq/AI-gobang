var chess = document.getElementById('chess'),
    ctx = chess.getContext('2d');
var me = true; // 初始化落子，默认黑先
var over = false; // 该局是否结束


// 赢法数组【统计所有赢法】
var wins = [];
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}
var count = 0; // 初始化赢法索引
// 横向赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
// 纵向赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
// 斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}
// 反斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

console.log(count); // 总共572中赢法

// 赢法统计数组初始化
var myWin = [],
    computerWin = [];
for (var i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}


// 初始化空棋盘，0为没落子，1为白子，2为黑子
var chessBoard = [];
for (var i = 0; i < 15; i++) {
    chessBoard[i] = [];
    for (var j = 0; j < 15; j++) {
        chessBoard[i][j] = 0;
    }
}

// 设置画线颜色
ctx.strokeStyle = '#BFBFBF';
// 画棋盘网格线
var drawChessBoard = function () {
    for (var i = 0; i < 15; i++) {
        // 定义棋盘表格-竖线
        ctx.moveTo(15 + i * 30, 15);
        ctx.lineTo(15 + i * 30, 435);
        // 定义棋盘表格-横线
        ctx.moveTo(15, 15 + i * 30);
        ctx.lineTo(435, 15 + i * 30);
        // 画线
        ctx.stroke();
    }
}

// 设置背景图片
var bg = new Image();
bg.src = "images/back.png"
bg.onload = function () {
    ctx.drawImage(bg, 0, 0, 450, 450);
    // 先设置背景图片，再画棋盘线，否则棋盘线会被背景图片挡住
    drawChessBoard();
}

/**
 * 绘制棋子方法
 * @param {number} i 棋子圆心横坐标
 * @param {number} j 棋子圆心纵坐标
 * @param {boolean} me 黑子:true，白子:false
 */
var oneStep = function (i, j, me) {
    ctx.beginPath();
    // 画扇形
    ctx.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    ctx.closePath();
    // 棋子渐变（位置稍微偏移+-2）
    var gradient = ctx.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if (me) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
    } else {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }
    ctx.fillStyle = gradient;
    // stroke为描边，fill为填充。
    ctx.fill();
}

// 落子
chess.onclick = function (e) {
    // 如果游戏已结束或者不是轮到我方下棋，则不能落子
    if (over || !me) return;
    // 获取点击位置
    var x = e.offsetX,
        y = e.offsetY;
    // 在棋盘点为圆心的直径为30的圆内点击，都落子在该棋盘点上
    var i = Math.floor(x / 30),
        j = Math.floor(y / 30);
    // 当前位置没落子的情况下才可以落子
    if (chessBoard[i][j] == 0) {
        oneStep(i, j, me);
        chessBoard[i][j] = 1;
        // 黑子为1，白子为2
        // chessBoard[i][j] = me ? 1 : 2;
        for (var k = 0; k < count; k++) {
            // 如果该落点符合某种赢法
            if (wins[i][j][k]) {
                // 那么符合该种赢法的子+1
                myWin[k]++;
                // 黑子落了，那么白子在这个位置不可能赢，设置为任意错误值，如6
                computerWin[k] = 6;
                // 当符合该种赢法的子达到5， 则判定你赢了
                if (myWin[k] == 5) {
                    window.alert("你赢了");
                    over = true;
                }
            }
        }
        // 如果还没结束，那么电脑落子
        if (!over) {
            me = !me;
            computerAI();
        }
    }
}

var computerAI = function () {
    // 初始化得分，用来作下棋权重
    var myScore = [],
        computerScore = [];
    // 初始化最大得分，最大得分点的坐标
    var max = 0,
        u = 0,
        v = 0;
    for (var i = 0; i < 15; i++) {
        myScore[i] = [];
        computerScore[i] = [];
        for (var j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    // 遍历棋盘，计算落子权重
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            // 如果所有可以落子的点进行权重计算
            if (chessBoard[i][j] == 0) {
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        switch (myWin[k]) {
                            case 1:
                                myScore[i][j] += 200;
                                break;
                            case 2:
                                myScore[i][j] += 400;
                                break;
                            case 3:
                                myScore[i][j] += 2000;
                                break;
                            case 4:
                                myScore[i][j] += 10000;
                                break;
                        }
                        switch (computerWin[k]) {
                            case 1:
                                computerScore[i][j] += 220;
                                break;
                            case 2:
                                computerScore[i][j] += 420;
                                break;
                            case 3:
                                computerScore[i][j] += 2100;
                                break;
                            case 4:
                                computerScore[i][j] += 20000;
                                break;
                        }
                    }
                }
                // 判断最好的落点
                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if (myScore[i][j] == max) {
                    if (computerScore[i][j] > myScore[i][j]) {
                        u = i;
                        v = j;
                    }
                }
                if (computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    u = i;
                    v = j;
                } else if (computerScore[i][j] == max) {
                    if (myScore[i][j] > computerScore[i][j]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }
    oneStep(u, v, false);
    chessBoard[u][v] = 2;
    for (var k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            computerWin[k]++;
            myWin[k] = 6;
            if (computerWin[k] == 5) {
                window.alert("电脑赢了");
                over = true;
            }
        }
    }
    // 如果还没结束，那么电脑落子
    if (!over) {
        me = !me;
    }
}


// todo:BUG：先弹出你赢了，再落子。
/**
 * 待优化：
 *  重开按钮
 *  可选执黑 or 执白
 *  可选玩家先 or 电脑先
 *  优化电脑AI算法：进攻防守占比等。让电脑更聪明。
 */