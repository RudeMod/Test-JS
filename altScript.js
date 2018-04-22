//=============================================================================
// altScript.js
//=============================================================================
/*
  Альтернативный набор решений для приложения. Основные отличия от script.js:
  
  1. Использованы глобальные переменные.
  2. Альтертивный алгоритм заполнения игровой карты. Реализация более сложная и 
     нагруженная, так что оригинальная предпочтительнее.
  3. Добавлена функция перезапуска игровой партии без перезагрузки страницы.

*/
//-----------------------------------------------------------------------------

////////////////////////////
//Глобальные переменные
////////////////////////////

var map = [];           //Карта игры, где проиндексированы все картинки
var maxImgs = 10;
var w, h;               //Ширина и высота игрового поля
var score, time, timer;

////////////////////////////

window.onload = function() {
    document.getElementById('tryAgain').onclick = function() { return restart() };
    
    var xml = new XMLHttpRequest();
    var url = "https://kde.link/test/get_field_size.php";

    xml.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
            //Получив ширину и высоту игрового поля, создаем карту и 
            //запускаем таймер
            var paramArr = JSON.parse(this.responseText);
            w = paramArr["width"];
            h = paramArr["height"];
            
            time = 0;
            score = 0;
            
            createMap();
            timer = timerStep();
        }
    };

    xml.open("GET", url, true);
    xml.send();
}

/**
 * Функция генерации игрового поля
 */
function createMap() {
    
    //Массив свободных для заполнения полей игровой карты
    var freeLinks = [];
    
    //Создаем список свободных полей
    for (var i = 0; i <= h-1; i++) {
        freeLinks[i] = {};
        freeLinks[i]["row"] = [];
        freeLinks[i]["index"] = i;
        
        for (var j = 0; j <= w-1; j++) {
            freeLinks[i]["row"][j] = j;
        }
    }

    var randRow, randCol, row, col;
    
    //Заполняем карту парами
    for (var i = -1; i <= (h*w)-2; i++) {
        
        randRow = Math.floor(Math.random() * freeLinks.length);
        randCol = Math.floor(Math.random() * freeLinks[randRow]["row"].length);
        
        row = freeLinks[randRow]["index"];
        col = freeLinks[randRow]["row"][randCol];
        
        if (!map[row]) map[row] = [];
        
        map[row][col] = Math.ceil( i/2 ) % maxImgs;
        
        //Удаляем использованый столбец из строки
        freeLinks[randRow]["row"].splice(randCol, 1);
        
        //Если в строке закончились столбцы - удаляем строку
        if (freeLinks[randRow]["row"].length === 0) {
            freeLinks.splice(randRow, 1)
        }
    }
    
    var tr, td;
    
    //Заполняем таблицу строками и столбцами
    for (row = 0; row <= h-1; row++) {
        tr = document.createElement('tr');
        document.getElementById('main_table').appendChild(tr);
        
        for (col = 0; col <= w-1; col++) {
            td = document.createElement('td');
            td.innerHTML = '<img src="'+imgURL[map[row][col]]+'">'
            td.onclick = function() { choose(this) };
            
            tr.appendChild(td);
        }
    }
}

/**
 * Обработка нажатия на поле
 *
 * @param {Object} td Выбранная ячейка
 */
function choose(td) {
    if (td.classList.contains("comp")) return;
    
    //Список выбраных полей
    selList = document.getElementsByClassName('sel');
    
    var td1, td2, x1, y1, x2, y2;
    
    //Скрываем изображения если уже показаны два
    if (selList.length >=2) {
        while (selList.length > 0) {
            selList[0].classList.remove('sel');
        }
    }
    
    td.classList.add('sel');
    
    //Сравниваем поля если выбраны два
    if (selList.length >=2) {
        td1 = selList[0];
        td2 = selList[1];
        
        x1 = td1.cellIndex;
        y1 = td1.parentNode.rowIndex
        
        x2 = td2.cellIndex;
        y2 = td2.parentNode.rowIndex
        
        if (map[y1][x1] === map[y2][x2]) {
            //Обновляем счет
            score += (3*h*w) - time

            document.getElementById("score").innerText = score;
            
            //Удаляем поля из игры
            td1.innerHTML = td2.innerHTML = "";
            td1.className = td2.className = "comp";
            td1.onclick = td2.onclick = null;
            
            //Если не осталось изображений - подводим итог
            if (document.getElementsByTagName("img").length === 0) finalScore();
        }
    }
}

/**
 * Обработка таймера
 *
 * @return {Number} Идентификатор таймера
 */
function timerStep () {
    return setInterval( function() {
            time++;
            
            document.getElementById("time").innerText = time;
        } , 1000);
}

/**
 * Показ результатов партии
 */
function finalScore() {
    
    //Скрываем основной контент
    document.getElementById('mainBlock').classList.add('hide');
    
    //Останавливаем таймер
    clearInterval(timer);
    
    document.getElementById("finalTime").innerText = time;
    document.getElementById("finalScore").innerText = score;
    
    var highscore = localStorage.getItem('highscore');
    if (!highscore) highscore = 0;
    
    //Если новый рекорд - отображаем сообщение об этом
    if (Number(highscore) < score) {
        document.getElementById("highscore").classList.remove('hide');
        localStorage.setItem('highscore', score);
    }
    
    document.getElementById('finalBlock').classList.remove('hide');
    
}

/**
 * Перезаупуск игры без перезагрузки страницы. Вызывается после нажатия на
 * ссылку Try again в окне результатов.
 *
 * @return {Boolean} false для отмены перехода по ссылке
 */
restart = function() {
    document.getElementById('main_table').innerHTML = "";
    document.getElementById("time").innerText = 0;
    document.getElementById("score").innerText = 0;
    document.getElementById("highscore").classList.add('hide')
    
    window.onload();
    
    document.getElementById('mainBlock').classList.remove('hide');
    document.getElementById('finalBlock').classList.add('hide');
    
    return false;
}

