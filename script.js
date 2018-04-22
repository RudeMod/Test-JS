//=============================================================================
// script.js
//=============================================================================

//-----------------------------------------------------------------------------

window.onload = function() {
    var xml = new XMLHttpRequest();
    var url = "https://kde.link/test/get_field_size.php";

    xml.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
            //Получив ширину и высоту игрового поля, создаем карту и 
            //запускаем таймер
            var paramArr = JSON.parse(this.responseText);
            createMap(paramArr);
            timerStep();
        }
    };

    xml.open("GET", url, true);
    xml.send();
}

/**
 * Функция генерации игрового поля
 *
 * @param {Array} paramArr распарсеный массив полученый с get_field_size.php
 */
function createMap(paramArr) {
    var h = paramArr["height"];
    var w = paramArr["width"];
    var maxImgs = 10;
    var map = []; //Карта игры, где проиндексированы все картинки
    var i = -1;
    
    //Заполняем массив последовательными парами (прим. [0,0,1,1,2,2...])
    for (var row = 0; row <= h-1; row++) {
        map[row] = [];
        
        for (var col = 0; col <= w-1; col++) {
            map[row][col] = Math.ceil( i/2 ) % maxImgs;
            i++;
        }
    }
    
    var randRow, randCol, randVal;
    
    //Перемешиваем позиции
    for (row = 0; row <= h-1; row++) {
        for (col = 0; col <= w-1; col++) {
        
            randRow = Math.floor(Math.random() * h);
            randCol = Math.floor(Math.random() * w);
            
            if (randRow === row && randCol === col) continue;
            
            randVal = map[randRow][randCol];
            map[randRow][randCol] = map[row][col];
            map[row][col] = randVal;
        }
    }
    
    var tr, td;
    var table = document.getElementById('main_table');
    
    //Заполняем таблицу строками и столбцами
    for (row = 0; row <= h-1; row++) {
        tr = document.createElement('tr');
        table.appendChild(tr);
        
        for (col = 0; col <= w-1; col++) {
            td = document.createElement('td');
            td.innerHTML = '<img src="'+imgURL[map[row][col]]+'">'
            td.onclick = function() { choose(this, map, h, w) };
            
            tr.appendChild(td);
        }
    }
}


/**
 * Обработка нажатия на поле
 *
 * @param {Object} td Выбранная ячейка
 * @param {Array} map Карта игрового поля
 * @param {Number} h  Высота игрового поля
 * @param {Number} w  Ширина игрового поля
 * @return undefined
 */
function choose(td, map, h, w) {
    if (td.classList.contains("comp")) return;
    
    selList = document.getElementsByClassName('sel'); //Список выбраных полей
    
    var td1, td2, x1, y1, x2, y2;
    var curScore, curTime, scoreElem;
    
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
        
        //Определяем координаты выбранных ячеек
        x1 = td1.cellIndex;
        y1 = td1.parentNode.rowIndex;
        
        x2 = td2.cellIndex;
        y2 = td2.parentNode.rowIndex;
        
        //Если выбранные поля сходятся
        if (map[y1][x1] === map[y2][x2]) {
            //Обновляем счет
            scoreElem = document.getElementById("score");
            curScore = Number(scoreElem.innerText);
            curTime = Number(document.getElementById("time").innerText);
            
            scoreElem.innerText = curScore + (5*h*w) - curTime;
            
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
 * @return undefined 
 */
function timerStep () {
    var time_elem = document.getElementById("time");
    
    var timer = setTimeout( function() {
            //Если счетчика таймера нет, значит игра закончена и все основные
            //элементы удалены
            if (!time_elem) return;
            
            var curent = Number(time_elem.innerText);
            time_elem.innerText = ++curent;
            
            timerStep();
        } , 1000);
}

//
/**
 * Показ результатов партии
 */
function finalScore() {
    var time = Number(document.getElementById("time").innerText);
    var score = Number(document.getElementById("score").innerText);
    var mainBlock = document.getElementById('mainBlock');
    
    //Скрываем и очищаем основной контент
    mainBlock.classList.add('hide');
    mainBlock.innerHTML = "";
    
    document.getElementById("finalTime").innerText = time;
    document.getElementById("finalScore").innerText = score;
    
    if (localStorage) { //В IE может не сработать localStorage
        var highscore = localStorage.getItem('highscore');
        if (!highscore) highscore = 0;
        
        //Если новый рекорд - отображаем сообщение об этом
        if (Number(highscore) < score) {
            document.getElementById("highscore").classList.remove('hide');
            localStorage.setItem('highscore', score);
        }
    }
    
    //Показываем блок итогов
    document.getElementById('finalBlock').classList.remove('hide');
}   
