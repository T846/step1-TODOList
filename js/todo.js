/*
 * Author : Tomohito Yashiro
 * Date   : 2016 / 06 / 15~  
 */ 

//前回のリセットから〜
//見た目
////詳細の表示　右側
////詳細入力のためのフォーム改変
//アニメーション

$(loaded);

function loaded() {
  appInit();
  showFinishTodoNum();
  showTodo();
  // ボタンをクリックしたときに実行するイベントを設定する
  $("#formButton").click(
    // コールバックとしてメソッドを引数にわたす
    function() {
      saveText();
      showTodo();
    });
}

//ローカルストレージにシステム用データがあるかを確認する
//無ければ作成する。
function appInit(){
  var length = localStorage.length;
  for (var i = 0; i < length; i++) {
    var key = localStorage.key(i);
    var data = JSON.parse(localStorage.getItem(key));
    // IDが一致するものがあるか比較

    if ( data[0] === 'checkNumber' ) {//型を無視して比較する
      return;
    }
  }
  //見つからなかったら、ローカルストレージにシステム用データを作る
  createCheckNumber();
}

//システム用データを作る
function createCheckNumber() {
  var jsonVal = [ 'checkNumber', 0 ];
  localStorage.setItem('checkNumber', JSON.stringify(jsonVal));
}

//完了したTODOの数をheaderに追加する
function showFinishTodoNum() {
  var header = $("#finishTodo");
  header.children("#checkNum").remove();
  var checkNum = JSON.parse(localStorage.getItem('checkNumber'));
  var html = [];
  html.push('<span id="checkNum">'+checkNum[1]+'</span>');
  header.prepend(html.join(''));
}

$(document).on("click", "#resetButton", function() {
  createCheckNumber();
  showFinishTodoNum();
});

$(document).on("click", "#deleteAllButton", function() {
  deleteAllTodo();
  showTodo();
});

$(document).on("click", ".finish", function() {
  finishTodo();
  deleteTodo(this);
  showTodo();
  showFinishTodoNum();
});

$(document).on("click", ".edit", function() {
  editTodo(this);
});

$(document).on("click", ".change", function() {
  changeTodo(this);
  showTodo();
});

$(document).on("click", ".cancel", function() {
  showTodo();
});

$(document).on("click", ".delete", function() {
  deleteTodo(this);
  showTodo();
});

function deleteAllTodo() {
  localStorage.clear();
}

function finishTodo() {
  var data = JSON.parse(localStorage.getItem('checkNumber'));
  var checkNum = data[1];
  var jsonVal = [ 'checkNumber', checkNum+1 ];
  localStorage.setItem('checkNumber', JSON.stringify(jsonVal));
}

function editTodo(elm) {
  var parentDiv = $(elm).closest(".todo");
  var todoID = parentDiv.attr("id");
  var key = searchKeyfromTodoID(todoID);
  var todoData = JSON.parse(localStorage.getItem(key));
  var todoText = todoData[1];
  var html = [];
  parentDiv.children(".todoText").remove();
  parentDiv.children(".todoFooter").remove();
  html.push('<div class="todoText">');
    html.push('<input class="inputTODO" type="text" value="' + todoText + '" maxlength="20">');
  html.push('</div>');
  html.push('<footer class="todoFooter">');
    html.push('<button class="change" type="button">変更</button>');
    html.push('<button class="cancel" type="button">取消</button>');
  html.push('</footer');
  parentDiv.append(html.join(''));
}

function changeTodo (elm) {
  var todoID = $(elm).closest(".todo").attr("id");
  var key = searchKeyfromTodoID(todoID);
  var todoData = JSON.parse(localStorage.getItem(key));
  var text = $(elm).closest(".todo").find(".inputTODO");
  var val = escapeText(text.val());
  if( checkText(text.val()) ){
    //TODOのデータを上書きして保存する
    todoData[1] = val
    localStorage.setItem(key, JSON.stringify(todoData));
    // テキストボックスを空にする
    text.val("");
  }
}

function deleteTodo(elm) {
  var todoID = $(elm).closest(".todo").attr("id");
  var key = searchKeyfromTodoID(todoID);
  localStorage.removeItem(key);
}

// 入力された内容をローカルストレージに保存する
function saveText() {
  var text = $("#formText");
  var time = new Date();
  var id = time.getTime();//UTC開始からのmsをtodoのIDにする
  var val = escapeText(text.val());
  if( checkText(text.val()) ){
    //現在時刻をkeyとしてjsonVal[TODOのid,テキスト,年月曜日]を保存する
    var jsonVal = [ id, val, getDateString(time) ];
    localStorage.setItem(time, JSON.stringify(jsonVal));
    // テキストボックスを空にする
    text.val("");
  }
}

// 文字をエスケープする
function escapeText(text) {
  return $("<div>").text(text).html();
}

// 入力チェックを行う
function checkText(text) {
  // 文字数が0または20以上は不可
  if (0 === text.length || 20 < text.length) {
    alert("文字数は1〜20字にしてください");
    return false;
  }

  // すでに入力された値があれば不可
  var length = localStorage.length;
  for (var i = 0; i < length; i++) {
    var key = localStorage.key(i);
    var todoData = JSON.parse(localStorage.getItem(key));
    // 内容が一致するものがあるか比較
    if (text === todoData[1]) {
      alert("同じ内容は避けてください");
      return false;
    }
  }

  // すべてのチェックを通過できれば可
  return true;
}

//ローカルストレージに保存したTODOを再描画する
function showTodo() {
  // すでにある要素を削除する
  var list = $("#list")
  list.children().remove();
  // ローカルストレージに保存された値すべてを要素に追加する
  var key, value, html = [];
  var todoData;
  var todoText, todoDate;
  for(var i=0, len=localStorage.length; i<len; i++) {
    key = localStorage.key((localStorage.length-1)-i);
    todoData = JSON.parse(localStorage.getItem(key));
    if(todoData[0] === 'checkNumber') continue; //この場合はTODOではないから無視する
    todoID   = todoData[0];
    todoText = todoData[1];
    todoDate = todoData[2];
    html.push('<div id='+todoID+' class="todo">');

      html.push('<header class="todoHeader">');
        html.push('<button class="finish" type="button">遂行</button>');
        html.push('<div class="todoDate">追加日：' + todoDate + '</div>');
      html.push('</header>');

      html.push('<div class="todoText">' + todoText + '</div>');

      html.push('<footer class="todoFooter">');
        html.push('<button class="edit" type="button">編集</button>');
        html.push('<button class="delete" type="button">削除</button>');
      html.push('</footer>');

    html.push('</div>');
  }
  list.append(html.join(''));
}

//Dateクラスを渡すと月,日,曜日を文字列にしたものを返す
function getDateString(Date) {
  return (Date.getMonth()+1)+'月'+Date.getDate()+'日'+'('+day(Date.getDay())+')';
}

//1~7の数字を渡すと月〜金の文字になる。
function day(Day){
  switch(Day){
    case 1: return '月';
    case 2: return '火';
    case 3: return '水';
    case 4: return '木';
    case 5: return '金';
    case 6: return '土';
    case 7: return '日';
  }
}

function searchKeyfromTodoID(todoID) {
  var length = localStorage.length;
  for (var i = 0; i < length; i++) {
    var key = localStorage.key(i);
    var todoData = JSON.parse(localStorage.getItem(key));
    //IDが一致するものがあるか比較
    //型を無視して比較する todoData:数字, todoID:文字列
    if ( todoData[0] == todoID ) {
      return key;
    }
  }
}