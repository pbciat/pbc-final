var websocket = new WebSocket("ws://127.0.0.1:8765/");
var times = 0;
var detect_key = true;
var start = new Date().getTime();
var beep = document.getElementById("beep"); // beep.wav
var wrong = document.getElementById("wrong"); // wrong.mp3
var mario = document.getElementById("mario"); // mario.mp3


/*
ToDo: Ignore keys other than space on staring or interval trials
*/

document.onkeydown = function(e) {
    e = e || window.event;

    if (detect_key && ((e.keyCode == 69 || e.keyCode == 73) || e.keyCode == 32)) {
        // Return early if space pressed in normal blocks
        if (['1', '2', '3', '4', '5'].indexOf(data.block) >= 0 &&
            e.keyCode == 32) { return; };
        // Return early if e or i pressed in interval blocks
        if (['0', '01', '12', '23', '34', '45'].indexOf(data.block) >= 0 &&
            e.keyCode != 32) { return; };
        // Always return early in begining or testFeedback block (freeze program)
        if (['6'].indexOf(data.block) >= 0) { return; };

        // pressed left key
        if (e.keyCode == 69) { // keycode for e
            RT = getRT();
            correct = (data.answer == 'left') ? 'true' : 'false';
            document.getElementById("E").click();  // button click effect
            resp_feedback('right');

            // pressed right key
        } else if (e.keyCode == 73) {
            RT = getRT();
            correct = (data.answer == 'right') ? 'true' : 'false';
            document.getElementById("I").click();  // button click effect
            resp_feedback('left');
        }
        // Pressed space
        else if (e.keyCode == 32) {
            RT = -1;
            correct = 'false'
            if (data.block != '0') {
                document.getElementById("content-text").innerHTML = 'Get Ready';
            };
            if (data.block == '0') {
                mario.play();
            }
        } else { window.alert("Bug in document.onkeydown"); };

        // lock key
        detect_key = false;

        // Clean up if Correct
        if (correct == 'true') setTimeout(cleanStim, 100);

        // send data to server
        if (e.keyCode == 32 && data.block != '0') { setTimeout(sendData, 1100); } // interval after interval block
        else if (e.keyCode == 32 && data.block == '0') { setTimeout(sendData, 300); } // interval after staring block
        else { setTimeout(sendData, 600); } // trials within a block: wait for 0.6 sec
    }
}

// Send data
function sendData() {
    sending = { 'correct': correct, 'rt': RT };
    websocket.send(JSON.stringify(sending));
}


/*
block: 3
type: text 
content: 真誠
answer: left
*/
websocket.onmessage = function(event) {
    data = JSON.parse(event.data);

    // Clean up previous stimulus
    cleanStim();
    cleanCues();

    switch (data.block) {
        // Testing Blocks
        case '3':
            process_block3();
            break;
        case '5':
            process_block5();
            break;
            // Pairing Blocks
        case '1':
            process_block1();
            break;
        case '2':
            process_block2();
            break;
        case '4':
            process_block4();
            break;
            // Interval Instructions
        case '01':
            process_block01();
            break;
        case '12':
            process_block12();
            break;
        case '23':
            process_block23();
            break;
        case '34':
            process_block34();
            break;
        case '45':
            process_block45();
            break;
            // 起始畫面 
        case '0':
            process_block0();
            break;
            // 結束畫面 (結果回饋)
        case '6':
            process_block6();
            break;
        default:
            window.alert("Undefined block"); // error handling
    }

    // start timer
    start = new Date().getTime();
    detect_key = true
};

///////////////////////////// Helper Functions /////////////////////////////

// 開始畫面
function process_block0() {
    document.getElementsByTagName('body')[0].style = 'background: linear-gradient(-225deg, #24EAC3, 55%, #3456C1);'
        // Beginning screen
    document.getElementById("content-text").innerHTML = `
    <div class="picture">
            <img id="TWpic" src="前端pic/TW.png">
        </div>
    <!--首頁底部按鈕-->
    <div class=bottom>
        <button class="next" type="button">NEXT</button>
        <div class="word">按空白鍵進入測驗解說</div>
    </div>
    
    `;
}

// Pairing Block: DPP 左;  KMT 右
function process_block1() {
    // present stimulus
    write_stim();
    // present button layouts: pos & DPP on left
    twobuttons('民進黨', '國民黨', '', '')
    /*
    document.getElementById("content-textB").innerHTML = `
    <div class="EI">
        <button id="E" type="button">E / 民進黨</button>
        <button id="I" type="button">I / 國民黨</button>
    </div>
    `;
    */
}

// Pairing Block: postive 左;  negative 右
function process_block2() {
    // present stimulus
    write_stim();
    // present button layouts: pos & DPP on left
    twobuttons('正面', '負面', '', '');
}

// Testing Block: DPP 左;  KMT 右;  postive 左;  negative 右
function process_block3() {
    // present stimulus
    write_stim();
    // present button layouts: pos & DPP on left
    twobuttons('正面', '負面', ' 民進黨 ', ' 國民黨 ');
}

// Pairing Block: KMT 左;  DPP 右
function process_block4() {
    // present stimulus
    write_stim();
    // present button layouts: DPP on left
    twobuttons('國民黨', '民進黨', '', '');
}

// Testing Block: KMT 左;  DPP 右;  postive 左;  negative 右
function process_block5() {
    // present stimulus
    write_stim();
    // present button layouts: pos & DPP on left
    twobuttons('正面', '負面', ' 國民黨', ' 民進黨');
}

// 結束畫面
function process_block6() {
    // Clear all cues
    cleanCues();

    var resp = 'undefined';
    switch (data.content) {
        case 'KMT':
            resp = 'You are KMTer!';
            break;
        case 'DPP':
            resp = 'You are DPPer!';
            break;
        case 'neutral':
            resp = 'You are neutral!';
            break;
        case 'tooMany':
            resp = 'You have too many wrong answers!';
            break;
        default:
            window.alert("Block 6 content undefined!!!"); // error handling
    }

    // Write Political party preference
    //document.getElementById("stimulus").innerHTML = data.content;
    document.getElementById("content-text").innerHTML = `
    <p id='test-feedback'>${resp}</p>
    `;
}

// Interval Blocks
function process_block01() {
    document.getElementsByTagName('body')[0].style = 'background: linear-gradient(90deg, #66CCCC, 55%, #6666CC);'
        // Write instructions
    document.getElementById("content-text").innerHTML = `
    <div class="inst">
        <p>注意下方的<b>類別標籤</b> ！！！</p>
        呈現的項目屬於<b>民進黨</b>：按 E 鍵<br>
        呈現的項目屬於<b>國民黨</b>：按 I 鍵
    </div>
    <div class=bottom>
        <button class="next" type="button">
            <p>START</p>
        </button>
        <div class="word">按空白鍵開始測驗</div>
    </div>
    `;
    twobuttons('民進黨', '國民黨', '', '');
};

function process_block12() {
    write_instuctions('正面', '負面', '', '');
    twobuttons('正面', '負面', '', '');
};

function process_block23() {
    write_instuctions('正面', '負面', '或<b>民進黨</b>', '或<b>國民黨</b>');
    twobuttons('正面', '負面', ' 民進黨 ', ' 國民黨 ');
};

function process_block34() {
    write_instuctions('國民黨', '民進黨', '', '');
    twobuttons('國民黨', '民進黨', '', '');
};

function process_block45() {
    write_instuctions('正面', '負面', '或<b>國民黨</b>', '或<b>民進黨</b>');
    twobuttons('正面', '負面', ' 國民黨', ' 民進黨');
};

function write_instuctions(left, right, left2, right2) {
    document.getElementById("content-text").innerHTML = `
    <div class="inst">
        <p>注意下方，<b>類別標籤已改變</b> ！！！</p>
        呈現的項目屬於<b>${left}</b>${left2}：按 E 鍵<br>
        呈現的項目屬於<b>${right}</b>${right2}：按 I 鍵<br>
        按空白鍵繼續測驗
    </div>
    `;
}

function twobuttons(l1, r1, l2, r2) {
    document.getElementById("content-textB").innerHTML = `
    <div class="EI">
        <button id="E" type="button" onclick="Print(this)">E / ${l1}${l2}</button>
        <button id="I" type="button" onclick="Print(this)">I / ${r1}${r2}</button>
    </div>
    `;
}


// Present stimulus
function write_stim() {
    if (data.type == 'text') {
        document.getElementById("content-text").innerHTML = data.content;
        if (data.cnpt_attr == 'a') {
            document.getElementById("content-text").style = 'font-size:3.0em;color:#fff9c7;';
        }
    } else if (data.type == 'img') {
        document.getElementById("content-img").src = data.content;
        document.getElementById("content-img").style = 'width:200px;height: 200px;';
    } else {
        window.alert('data.type not text nor img')
    }
}

// Response feedback: Play different sound for correct or wrong answer
function resp_feedback(wrongAnswer) {
    if (data.answer == wrongAnswer) {
        cleanStim();
        document.getElementById("content-text").innerHTML = 'WRONG';
        document.getElementById("content-text").style = 'color:red;font-weight:bold;font-size:3em';
        wrong.play();
    } else beep.play();
}

// Clean up previous stimulus
function cleanStim() {
    document.getElementById("content-text").innerHTML = '';
    document.getElementById("content-text").style = '';
    document.getElementById("content-img").src = '';
    document.getElementById("content-img").style = '';
}

// Clean up previous cues
function cleanCues() {
    /*
    document.getElementById("left-cue1").innerHTML = '';
    document.getElementById("left-cue2").innerHTML = '';
    document.getElementById("right-cue1").innerHTML = '';
    document.getElementById("right-cue2").innerHTML = '';
    */
    document.getElementById("content-textB").innerHTML = '';
}

function getRT() {
    var end = new Date().getTime();
    var timeTaken = (end - start) / 1000;
    return timeTaken
}

// Show button click effect
Print = function(button){
	button.style = 'background:rgb(124, 120, 120);color:white;';
	setTimeout( function(){ button.style = ''; }, 200 );
}