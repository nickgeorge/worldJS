goog.provide('PromptBox');

goog.require('KeyCode');

/**
 * @constructor
 * @struct
 */
PromptBox = function() {
  this.div = document.createElement('div');
  this.div.id = 'prompt-box';

  this.promptMessageDiv = document.createElement('span');
  this.promptMessageDiv.style.paddingRight = '6px';
  this.div.appendChild(this.promptMessageDiv);

  this.inputDiv = document.createElement('input');
  this.inputDiv.style.width = '149px';
  this.inputDiv.type = 'text';
  this.div.appendChild(this.inputDiv);


  this.callback = null;
  this.open = false;

  this.inputDiv.addEventListener('keydown',
      util.bind(function(/** Event */ event) {
        if (this.open && event.keyCode == KeyCode.ENTER) {
          this.close();
        }
      }, this));
};
PromptBox.instance = new PromptBox();


PromptBox.ask = function(promptMsg, callback) {
  PromptBox.instance.ask(promptMsg, callback);
};


PromptBox.prototype.ask = function(promptMsg, callback) {
  this.callback = callback;

  // if (ContainerManager.getInstance().isFullScreen()) {

  // } else {
    this.div.style.left = (Math.floor(Env.hud.canvas.offsetWidth / 2) - 150) + 'px';
    this.div.style.top = (Math.floor(Env.hud.canvas.offsetHeight * 3 / 4) - 20) + 'px';
  // }
  this.promptMessageDiv.innerHTML = promptMsg;
  this.inputDiv.value = '';
  document.getElementById('fullscreen-tab').appendChild(this.div);
  var inputDiv = this.inputDiv;
  setTimeout(function() { inputDiv.focus(); }, 0);
  this.open = true;
};


PromptBox.prototype.close = function() {
  document.getElementById('fullscreen-tab').removeChild(this.div);
  this.callback(this.inputDiv.value);
  this.open = false;
  document.getElementById('game-div').focus();
};
