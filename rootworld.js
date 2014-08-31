var Env={world:null,hud:null,gl:null,setEnvironment:function(a,b,c){Env.world=a;Env.hud=b;Env.gl=c}};var FullWindowResizer=function(a,b,c,d){this.gl=a;this.glCanvas=b;this.hud=c;this.hudCanvas=d};FullWindowResizer.prototype.resize=function(){this.glCanvas.width=window.innerWidth;this.glCanvas.height=window.innerHeight;this.gl.viewportWidth=window.innerWidth;this.gl.viewportHeight=window.innerHeight;this.hudCanvas.width=window.innerWidth;this.hudCanvas.height=window.innerHeight;this.hud.resize();this.hud.render()};
FullWindowResizer.prototype.attachEventListener=function(){window.addEventListener("resize",util.bind(this.resize,this))};var GL=WebGLRenderingContext;GL.createGL=function(a){var b;try{b=a.getContext("experimental-webgl")}catch(c){throw Error("Didn't init GL");}b.viewportWidth=a.width;b.viewportHeight=a.height;b.modelMatrix=mat4.create();b.invertedModelMatrix=mat4.create();b.viewMatrix=mat4.create();b.perspectiveMatrix=mat4.create();b.normalMatrix=mat3.create();b.modelMatrixStack=new MatrixStack;b.viewMatrixStack=new MatrixStack;b.canvas=a;b.activeShaderProgram=null;return b};
GL.createGLWithDefaultShaders=function(a){a=GL.createGL(a);var b=ShaderProgram.createProgramWithDefaultShaders(a);a.setActiveProgram(b);return a};GL.prototype.setActiveProgram=function(a){this.activeShaderProgram=a;this.useProgram(a)};GL.prototype.getActiveProgram=function(){return this.activeShaderProgram};
GL.prototype.reset=function(a){util.assert(0==this.modelMatrixStack.nextIndex,"Model matrix stack not fully unloaded");util.assert(0==this.viewMatrixStack.nextIndex,"View matrix stack not fully unloaded");this.viewport(0,0,this.viewportWidth,this.viewportHeight);this.clearColor(a[0],a[1],a[2],a[3]);this.clear(GL.COLOR_BUFFER_BIT|GL.DEPTH_BUFFER_BIT);mat4.perspective(this.perspectiveMatrix,Math.PI/4,this.viewportWidth/this.viewportHeight,.1,400);this.enable(GL.DEPTH_TEST);this.enable(GL.BLEND);this.enable(GL.CULL_FACE);
this.blendFunc(GL.SRC_ALPHA,GL.ONE_MINUS_SRC_ALPHA);mat4.identity(this.modelMatrix);this.getActiveProgram().reset()};GL.prototype.pushModelMatrix=function(){this.modelMatrixStack.push(this.modelMatrix)};GL.prototype.popModelMatrix=function(){mat4.copy(this.modelMatrix,this.modelMatrixStack.pop())};GL.prototype.pushViewMatrix=function(){this.viewMatrixStack.push(this.viewMatrix)};GL.prototype.popViewMatrix=function(){mat4.copy(this.viewMatrix,this.viewMatrixStack.pop())};
GL.prototype.setModelMatrixUniforms=function(){var a=this.getActiveProgram();this.computeNormalMatrix();this.uniformMatrix4fv(a.modelMatrixUniform,!1,this.modelMatrix);this.uniformMatrix3fv(a.normalMatrixUniform,!1,this.normalMatrix)};GL.prototype.setViewMatrixUniforms=function(){var a=this.getActiveProgram();this.uniformMatrix4fv(a.perspectiveMatrixUniform,!1,this.perspectiveMatrix);this.uniformMatrix4fv(a.viewMatrixUniform,!1,this.viewMatrix)};
GL.prototype.computeNormalMatrix=function(){mat3.fromMat4(this.normalMatrix,mat4.invert(this.invertedModelMatrix,this.modelMatrix));mat3.transpose(this.normalMatrix,this.normalMatrix)};GL.prototype.rotate=function(){var a=mat4.create();return function(b){mat4.multiply(this.modelMatrix,this.modelMatrix,mat4.fromQuat(a,b))}}();GL.prototype.translate=function(a){mat4.translate(this.modelMatrix,this.modelMatrix,a)};GL.prototype.transform=function(a){mat4.multiply(this.modelMatrix,this.modelMatrix,a)};
GL.prototype.rotateView=function(){var a=mat4.create();return function(b){mat4.multiply(this.viewMatrix,this.viewMatrix,mat4.fromQuat(a,b))}}();GL.prototype.translateView=function(a){mat4.translate(this.viewMatrix,this.viewMatrix,a)};GL.prototype.updateBuffer=function(a,b){this.bindBuffer(GL.ARRAY_BUFFER,a);this.bufferSubData(GL.ARRAY_BUFFER,0,new Float32Array(b))};
GL.prototype.generateBuffer=function(a,b,c,d){d=d||GL.STATIC_DRAW;c=c||GL.ARRAY_BUFFER;var e=this.createBuffer();this.bindBuffer(c,e);this.bufferData(c,new Float32Array(a),d);e.itemSize=b;e.numItems=a.length/b;return e};GL.prototype.generateIndexBuffer=function(a){var b=this.createBuffer();this.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,b);this.bufferData(GL.ELEMENT_ARRAY_BUFFER,new Uint16Array(a),GL.STATIC_DRAW);b.itemSize=1;b.numItems=a.length;return b};var MatrixStack=function(){this.stack=[];this.nextIndex=0};MatrixStack.prototype.push=function(a){this.stack[this.nextIndex]?mat4.copy(this.stack[this.nextIndex],a):this.stack.push(mat4.clone(a));this.nextIndex++};MatrixStack.prototype.pop=function(){this.nextIndex--;if(-1==this.nextIndex)throw Error("Invalid matrix pop!");return this.stack[this.nextIndex]};var ShaderProgram=function(){};ShaderProgram.USE_TEXTURE_DEFAULT=!1;ShaderProgram.USE_LIGHTING_DEFAULT=!0;ShaderProgram.UNIFORM_COLOR_DEFAULT=[1,1,1,1];ShaderProgram.UNIFORM_SCALE_DEFAULT=[1,1,1];ShaderProgram.defaultDomain="http://www.biologicalspeculation.com";ShaderProgram.loadExternalShader=function(a,b,c){var d=new XMLHttpRequest;d.open("GET",b,!1);d.send();return ShaderProgram.createShader(a,d.responseText,c)};
ShaderProgram.createShader=function(a,b,c){c=a.createShader(c);a.shaderSource(c,b);a.compileShader(c);return a.getShaderParameter(c,a.COMPILE_STATUS)?c:(alert(a.getShaderInfoLog(c)),null)};
ShaderProgram.createProgramWithDefaultShaders=function(a){var b=ShaderProgram.loadExternalShader(a,ShaderProgram.defaultDomain+"/rootworld/shaders/fragment.shader",a.FRAGMENT_SHADER),c=ShaderProgram.loadExternalShader(a,ShaderProgram.defaultDomain+"/rootworld/shaders/vertex.shader",a.VERTEX_SHADER);return ShaderProgram.createShaderProgram(a,c,b)};
ShaderProgram.createShaderProgram=function(a,b,c){var d=a.createProgram();d.gl=a;a.attachShader(d,b);a.attachShader(d,c);a.linkProgram(d);a.getProgramParameter(d,a.LINK_STATUS)||alert("Could not initialise shaders");a.useProgram(d);d.vertexPositionAttribute=a.getAttribLocation(d,"aVertexPosition");d.vertexPositionAttribute=a.getAttribLocation(d,"aVertexPosition");d.vertexNormalAttribute=a.getAttribLocation(d,"aVertexNormal");d.textureCoordAttribute=a.getAttribLocation(d,"aTextureCoord");a.enableVertexAttribArray(d.vertexPositionAttribute);
a.enableVertexAttribArray(d.vertexColorAttribute);a.enableVertexAttribArray(d.vertexPositionAttribute);a.enableVertexAttribArray(d.vertexNormalAttribute);a.enableVertexAttribArray(d.textureCoordAttribute);d.perspectiveMatrixUniform=a.getUniformLocation(d,"uPerspectiveMatrix");d.modelMatrixUniform=a.getUniformLocation(d,"uModelMatrix");d.viewMatrixUniform=a.getUniformLocation(d,"uViewMatrix");d.normalMatrixUniform=a.getUniformLocation(d,"uNormalMatrix");d.samplerUniform=a.getUniformLocation(d,"uSampler");
d.ambientColorUniform=a.getUniformLocation(d,"uAmbientColor");d.pointLightingLocationUniform=a.getUniformLocation(d,"uPointLightingLocation");d.eyeLocationUniform=a.getUniformLocation(d,"uEyeLocation");d.pointLightingColorUniform=a.getUniformLocation(d,"uPointLightingColor");d.useLightingUniform=a.getUniformLocation(d,"uUseLighting");d.useTextureUniform=a.getUniformLocation(d,"uUseTexture");d.uniformColor=a.getUniformLocation(d,"uColor");d.uniformScale=a.getUniformLocation(d,"uScale");for(var e in ShaderProgram.prototype)d[e]=
ShaderProgram.prototype[e];d.loadedTexture=-1;d.loadedColor=[];d.loadedScale=[];d.loadedNormalBuffer=null;d.loadedIndexBuffer=null;d.loadedPositionBuffer=null;return d};ShaderProgram.prototype.reset=function(){this.setUseLighting(ShaderProgram.USE_LIGHTING_DEFAULT);this.setUseTexture(ShaderProgram.USE_TEXTURE_DEFAULT);this.setUniformColor(ShaderProgram.UNIFORM_COLOR_DEFAULT);this.setUniformScale(ShaderProgram.UNIFORM_SCALE_DEFAULT)};
ShaderProgram.prototype.setUseLighting=function(a){this.gl.uniform1i(this.useLightingUniform,a)};ShaderProgram.prototype.setUseTexture=function(a){this.gl.uniform1i(this.useTextureUniform,a)};ShaderProgram.prototype.setUniformColor=function(a){vec4.equals(a,this.loadedColor)||(this.loadedColor=a,this.gl.uniform4fv(this.uniformColor,a))};ShaderProgram.prototype.setUniformScale=function(a){vec4.equals(a,this.loadedScale)||(this.loadedScale=a,this.gl.uniform3fv(this.uniformScale,a))};
ShaderProgram.prototype.bindVertexPositionBuffer=function(a){this.loadedPositionBuffer!=a&&(this.loadedPositionBuffer=a,this.bindAttributeBuffer_(a,this.vertexPositionAttribute))};ShaderProgram.prototype.bindVertexNormalBuffer=function(a){this.loadedNormalBuffer!=a&&(this.loadedNormalBuffer=a,this.bindAttributeBuffer_(a,this.vertexNormalAttribute))};ShaderProgram.prototype.bindVertexTextureBuffer=function(a){this.loadedTextureBuffer!=a&&(this.loadedTextureBuffer=a,this.bindAttributeBuffer_(a,this.textureCoordAttribute))};
ShaderProgram.prototype.bindVertexIndexBuffer=function(a){this.loadedIndexBuffer!=a&&(this.loadedIndexBuffer=a,this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,a))};ShaderProgram.prototype.bindAttributeBuffer_=function(a,b){this.gl.bindBuffer(GL.ARRAY_BUFFER,a);this.gl.vertexAttribPointer(b,a.itemSize,GL.FLOAT,!1,0,0)};ShaderProgram.prototype.bindTexture=function(a){this.loadedTexture!=a&&(this.loadedTexture=a,this.gl.activeTexture(GL.TEXTURE0),this.gl.bindTexture(GL.TEXTURE_2D,a))};var ControlledList=function(){this.elements=[];this.elementsToAdd=[];this.elementsToRemove=[]};ControlledList.prototype.get=function(a){return this.elements[a]};ControlledList.prototype.getAll=function(a){return this.elements};ControlledList.prototype.add=function(a){this.elementsToAdd.push(a)};ControlledList.prototype.remove=function(a){this.elementsToRemove.push(a)};ControlledList.prototype.size=function(){return this.elements.length};
ControlledList.prototype.update=function(){util.array.pushAll(this.elements,this.elementsToAdd);this.elementsToAdd.length=0;util.array.removeAll(this.elements,this.elementsToRemove);this.elementsToRemove.length=0};ControlledList.prototype.forEach=function(a,b){util.array.forEach(this.elements,a,b)};var Framerate=function(){this.lastTime=0;this.numFramerates=30;this.averageUpdateInterval=500;this.renderTime=-1;this.framerates=[];this.rollingAverage=0};Framerate.prototype.calcRollingAverage=function(){for(var a=0,b=0;this.framerates[b];b++)a+=this.framerates[b];this.rollingAverage=Math.round(a/this.framerates.length)};
Framerate.prototype.snapshot=function(){if(0>this.renderTime)this.renderTime=(new Date).getTime();else{var a=(new Date).getTime(),b=a-this.renderTime;if(0!=b){for(this.framerates.push(1E3/b);this.framerates.length>this.numFramerates;)this.framerates.shift();this.renderTime=a;this.calcRollingAverage()}}};var Animator=function(a,b,c){this.world=a;this.hud=b;this.gl=c;this.framerate=new Framerate;this.paused=!1;this.boundTick=util.bind(this.tick,this)};Animator.instance_=null;Animator.initSingleton=function(a,b,c){util.assertNull(Animator.instance_,"Cannot init Animator: already init'd");Animator.instance_=new Animator(a,b,c);return Animator.instance_};Animator.getInstance=function(){return Animator.instance_};Animator.prototype.start=function(){this.drawScene();this.tick()};
Animator.prototype.setPaused=function(a){this.paused=a};Animator.prototype.togglePause=function(){this.paused=!this.paused};Animator.prototype.isPaused=function(){return this.paused};Animator.prototype.tick=function(){window.requestAnimationFrame(this.boundTick);this.paused||(this.advanceWorld(),this.drawScene());this.hud.render()};Animator.prototype.drawScene=function(){this.world.draw()};
Animator.prototype.advanceWorld=function(){var a=(new Date).getTime();if(0!=this.framerate.lastTime){var b=a-this.framerate.lastTime;100>b&&(this.world.advance(b/1E3),this.framerate.snapshot())}this.framerate.lastTime=a};Animator.prototype.getRollingAverageFramerate=function(){return this.framerate.rollingAverage};Animator.prototype.profile=function(a){this.paused=!1;console.profile();setTimeout(function(){console.profileEnd();this.paused=!0},1E3*a)};var Quadratic=function(a,b,c){this.a=a;this.b=b;this.c=c;this.discriminant=b*b-4*a*c};Quadratic.prototype.valueAt=function(a){return this.a*a*a+this.b*a+this.c};Quadratic.prototype.rootCount=function(){return 0<this.discriminant?2:0==this.discriminant?1:0};Quadratic.prototype.firstRoot=function(){return(-this.b-Math.sqrt(this.discriminant))/(2*this.a)};Quadratic.prototype.minT=function(){return-this.b/(2*this.a)};Quadratic.prototype.minValue=function(){return this.valueAt(this.minT())};
Quadratic.newLineToOriginQuadratic=function(a,b,c){for(var d=0,e=0,g=0,f=0;3>f;f++)d+=util.math.sqr(b[f]),e+=2*b[f]*a[f],g+=util.math.sqr(a[f]);g-=util.math.sqr(c||0);return new Quadratic(d,e,g)};Quadratic.newLineToPointQuadratic=function(a,b,c,d){for(var e=0,g=0,f=0,h=0;3>h;h++)e+=util.math.sqr(b[h]-c[h]),g+=2*(b[h]-c[h])*a[h],f+=util.math.sqr(a[h]);f-=util.math.sqr(d||0);return new Quadratic(e,g,f)};Quadratic.inFrame=function(a){return 0<=a&&1>=a};var goog={provide:function(){},require:function(){},inherits:function(a,b){function c(){}c.prototype=b.prototype;a.superClass_=b.prototype;a.prototype=new c;a.prototype.constructor=a},base:function(a,b,c){var d=arguments.callee.caller;if(d.superClass_)return d.superClass_.constructor.apply(a,Array.prototype.slice.call(arguments,1));for(var e=2<arguments.length?Array.prototype.slice.call(arguments,2):util.emptyArray_,g=!1,f=a.constructor;f;f=f.superClass_&&f.superClass_.constructor)if(f.prototype[b]===
d)g=!0;else if(g)return f.prototype[b].apply(a,e);if(a[b]===d)return a.constructor.prototype[b].apply(a,e);throw Error("goog.base called from a method of one name to a method of a different name");}},util={degToRad:function(a){return a*Math.PI/180},unimplemented:function(){throw Error("Unsupported Operation");},emptyImplementation:function(){},partial:function(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=Array.prototype.slice.call(arguments);b.unshift.apply(b,c);return a.apply(this,
b)}},bind:function(a,b,c){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);c.unshift.apply(c,d);return a.apply(b,c)}},emptyArray_:[],requiredPaths_:[],require:function(a){-1==util.requiredPaths_.indexOf(a)&&(util.requiredPaths_.push(a),document.write('<script src="/'+a+'">\x3c/script>'))},useCss:function(a){-1==util.requiredPaths_.indexOf(a)&&(util.requiredPaths_.push(a),document.write('<link rel="stylesheet" type="text/css" href="/'+a+'">'))},
renderSoy:function(a,b,c){a.innerHTML=b(c)},assert:function(a,b){if(!a)throw Error(b);},assertNotNull:function(a,b){if(null===a||void 0===a)throw Error(b);},assertNull:function(a,b){if(null!==a)throw Error(b);},assertEquals:function(a,b,c){if(a!=b)throw Error(c);},sqr:function(a){return a*a},style:{}};util.style.getRgbValues=function(a){a=a.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);return{red:parseInt(a[1],10),green:parseInt(a[2],10),blue:parseInt(a[3],10)}};
util.style.toRgbString=function(a){return"rgb("+a.red+", "+a.green+", "+a.blue+")"};util.dom={};util.dom.getClosest=function(a,b){for(;!util.dom.matches(a,b)&&a.parentElement;)a=a.parentElement;return util.dom.matches(a,b)?a:null};util.dom.isChild=function(a,b){for(;a!=b&&a.parentElement;)a=a.parentElement;return a==b};util.dom.find=function(a,b){return util.array.getOnlyElement(util.dom.findAll(a,b))};util.dom.findAll=function(a,b){return Array.prototype.slice.apply((b||document).querySelectorAll(a))};
util.dom.hasClass=function(a,b){return a.classList.contains(b)};util.dom.addClass=function(a,b){a.classList.add(b)};util.dom.removeClass=function(a,b){a.classList.remove(b)};util.dom.matches=function(a,b){if(!a.parentElement)throw Error("Cannot invoke util.dom.matches on a node with no parent.");return-1!=util.dom.findAll(b,a.parentElement).indexOf(a)};util.dom.getData=function(a,b){return a.dataset[b]};util.dom.getIntData=function(a,b){return parseInt(util.dom.getData(a,b),10)};
util.dom.hide=function(a){a.style.display="none"};util.fn={};util.fn.addClass=function(a){return function(b){b.classList.add(a)}};util.fn.removeClass=function(a){return function(b){b.classList.remove(a)}};util.fn.pluck=function(a){return function(b){return b[a]}};util.fn.equals=function(a){return function(b){return b===a}};util.fn.outputEquals=function(a,b){return function(c){return a(c)===b}};util.fn.pluckEquals=function(a,b){return function(c){return c[a]===b}};
util.fn.not=function(a){return function(){return!a.apply(this,arguments)}};util.fn.greaterThan=function(a){return function(b){return b>a}};util.fn.constant=function(a){return function(){return a}};util.fn.goTo=function(a){return function(){window.location.href=a}};util.fn.noOp=function(){};util.array={};util.array.pushAll=function(a,b){Array.prototype.push.apply(a,b)};util.array.removeAll=function(a,b){for(var c=0;c<b.length;c++)util.array.remove(a,b[c])};
util.array.apply=function(a,b,c,d,e){for(var g=0,f;f=a[g];g++)f[b](c,d,e)};util.array.remove=function(a,b){for(var c;-1!=(c=a.indexOf(b));)a.splice(c,1);return a};util.array.flatten=function(a){for(var b=[],c=0;a[c];c++)a[c].flatten?a.pushAll(a[c].flatten()):b.push(a[c])};util.array.average=function(a){for(var b=0,c=a.length,d=0;d<c;d++)b+=a[d];return b/c};util.array.pluck=function(a,b){var c=[];a.forEach(function(a){c.push(a[b])});return c};
util.array.forEach=function(a,b,c){for(var d=a.length,e=0;e<d;e++)e in a&&b.call(c,a[e],e,a)};util.array.map=function(a,b,c){for(var d=a.length,e=[],g=0;g<d;g++)g in a&&e.push(b.call(c,a[g],g,a));return e};util.array.getOnlyElement=function(a){util.assertEquals(1,a.length,"Array must have only one element.  Length: "+a.length);return a[0]};util.object={};util.object.forEach=function(a,b,c){for(var d in a)b.call(c,a[d],d,a)};
util.object.toArray=function(a,b,c){var d=[];util.object.forEach(a,function(a,g,f){d.push(b.call(c,a,g,f))},c);return d};util.object.shallowClone=function(a){var b={},c;for(c in a)b[c]=a[c];return b};util.math={ROOT_2:Math.sqrt(2)};util.math.sqr=function(a){return a*a};util.math.random=function(a,b){return Math.random()*(b-a)+a};util.math.clamp=function(a,b,c){return Math.min(Math.max(a,b),c)};var HUD=function(a){this.canvas=a;this.context=a.getContext("2d");this.isRendering=!0;this.widgets=[]};HUD.prototype.render=function(){this.isRendering&&(this.clear(),util.array.forEach(this.widgets,function(a){a.render()}))};HUD.prototype.addWidget=function(a){this.widgets.push(a);a.context=this.context;a.resize();return this};HUD.prototype.resize=function(){util.array.forEach(this.widgets,function(a){a.resize()})};HUD.prototype.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};
var Widget=function(a,b,c,d){this.context=null;this.x=a;this.y=b;this.position=null;this.font=c;this.fillStyle=d};Widget.prototype.resize=function(){this.position=[0<this.x?this.x:this.context.canvas.width+this.x,0<this.y?this.y:this.context.canvas.height+this.y]};Widget.prototype.setFont=function(a,b){this.context.font=a||this.font;this.context.fillStyle=b||this.fillStyle};var Fraps=function(a,b){Widget.call(this,a,b,"bold 16px courier")};goog.inherits(Fraps,Widget);
Fraps.prototype.render=function(){Animator.getInstance();var a=Animator.getInstance().getRollingAverageFramerate();this.setFont(null,45>a?"#F00":"#0F0");this.context.fillText("FPS: "+a,this.position[0],this.position[1])};var Crosshair=function(){Widget.call(this)};goog.inherits(Crosshair,Widget);Crosshair.prototype.resize=function(){this.position=[this.context.canvas.width/2,this.context.canvas.height/2]};
Crosshair.prototype.render=function(){Animator.getInstance().isPaused()||(this.context.strokeStyle="#ff0000",this.context.translate(this.position[0],this.position[1]),this.context.beginPath(),this.context.moveTo(-10,0),this.context.lineTo(10,0),this.context.stroke(),this.context.beginPath(),this.context.moveTo(0,-10),this.context.lineTo(0,10),this.context.stroke(),this.context.translate(-this.position[0],-this.position[1]))};
var Logger=function(a,b){Widget.call(this,a,b,"bold 20px courier","#0F0");this.activeLines=0;this.maxLinesToShow=3;this.index=0;this.lines=[]};goog.inherits(Logger,Widget);Logger.prototype.log=function(a){this.lines.push(a);this.activeLines=Math.min(this.maxLinesToShow,this.activeLines+1);setTimeout(util.bind(this.fade,this),5E3)};Logger.prototype.fade=function(){this.activeLines=Math.max(0,this.activeLines-1)};
Logger.prototype.render=function(){if(this.activeLines){this.setFont();var a=this.lines.length;this.context.fillText(this.lines[a-1],this.position[0],this.position[1]);this.setFont("16px courier","#AAA");for(var b=1;b<this.activeLines&&b<this.maxLinesToShow;b++){var c=this.lines[a-b-1];if(!c)break;this.context.fillText(c,this.position[0],this.position[1]+25*b)}}};var StartButton=function(){Widget.call(this,0,0,"56px wolfenstein","#FFF")};goog.inherits(StartButton,Widget);
StartButton.prototype.render=function(){Animator.getInstance().isPaused()&&(this.setFont(),this.context.fillText("Klicken f"+String.fromCharCode(252)+"r St"+String.fromCharCode(228)+"rten",this.context.canvas.width/2-200,this.context.canvas.height/2-25))};var KeyCode={MAC_ENTER:3,BACKSPACE:8,TAB:9,NUM_CENTER:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,PRINT_SCREEN:44,INSERT:45,DELETE:46,ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,FF_SEMICOLON:59,FF_EQUALS:61,FF_DASH:173,QUESTION_MARK:63,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,
META:91,WIN_KEY_RIGHT:92,CONTEXT_MENU:93,NUM_ZERO:96,NUM_ONE:97,NUM_TWO:98,NUM_THREE:99,NUM_FOUR:100,NUM_FIVE:101,NUM_SIX:102,NUM_SEVEN:103,NUM_EIGHT:104,NUM_NINE:105,NUM_MULTIPLY:106,NUM_PLUS:107,NUM_MINUS:109,NUM_PERIOD:110,NUM_DIVISION:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SCROLL_LOCK:145,FIRST_MEDIA_KEY:166,LAST_MEDIA_KEY:183,SEMICOLON:186,DASH:189,EQUALS:187,COMMA:188,PERIOD:190,SLASH:191,APOSTROPHE:192,TILDE:192,SINGLE_QUOTE:222,
OPEN_SQUARE_BRACKET:219,BACKSLASH:220,CLOSE_SQUARE_BRACKET:221,WIN_KEY:224,MAC_FF_META:224,MAC_WK_CMD_LEFT:91,MAC_WK_CMD_RIGHT:93,WIN_IME:229,PHANTOM:255};var ContainerManager=function(a){this.container=a;this.keyMap={};this.mouseMap={};this.resolvePrefixes();this.container.addEventListener("keydown",util.bind(this.onKey,this));this.container.addEventListener("keyup",util.bind(this.onKey,this));this.container.addEventListener("mousedown",util.bind(this.onMouseButton,this));this.container.addEventListener("mouseup",util.bind(this.onMouseButton,this));this.container.focus()};ContainerManager.instance_=null;
ContainerManager.initSingleton=function(a){util.assertNull(ContainerManager.instance_,"Cannot init ContainerManager: already init'd");ContainerManager.instance_=new ContainerManager(a);return ContainerManager.instance_};ContainerManager.getInstance=function(){return ContainerManager.instance_};ContainerManager.prototype.onKey=function(a){this.keyMap[a.keyCode]="keydown"==a.type};ContainerManager.prototype.onMouseButton=function(a){this.keyMap[a.button]="mousedown"==a.type};
ContainerManager.prototype.isKeyDown=function(a){return this.keyMap[a]};ContainerManager.prototype.isMouseButtonDown=function(a){return this.mouseMap[a]};ContainerManager.prototype.setFullScreen=function(a){a?this.container.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT):this.container.exitFullScreen()};ContainerManager.prototype.setPointerLock=function(a){a?this.container.requestPointerLock():this.container.exitPointerLock()};
ContainerManager.prototype.isPointerLocked=function(){return Boolean(document.pointerLockElement||document.mozPointerLockElement||document.webkitPointerLockElement)};
ContainerManager.prototype.resolvePrefixes=function(){this.container.requestFullScreen=this.container.requestFullscreen||this.container.mozRequestFullScreen||this.container.webkitRequestFullscreen;this.container.exitFullScreen=this.container.exitFullscreen||this.container.mozCancelFullScreen||this.container.webkitExitFullscreen;this.container.requestPointerLock=this.container.requestPointerLock||this.container.mozRequestPointerLock||this.container.webkitRequestPointerLock;document.exitPointerLock=
document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;document.fullScreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement};var WorldInputAdapter=function(){this.onPointerLockChange=this.onMouseButton=this.onKey=this.onMouseMove=util.fn.noOp;this.attachEvents()};WorldInputAdapter.prototype.isKeyDown=function(a){return ContainerManager.getInstance().isKeyDown(a)};WorldInputAdapter.prototype.isMouseButtonDown=function(a){return ContainerManager.getInstance().isMouseButtonDown(a)};WorldInputAdapter.prototype.isPointerLocked=function(){return ContainerManager.getInstance().isPointerLocked()};
WorldInputAdapter.prototype.setKeyHandler=function(a,b){this.onKey=util.bind(a,b);return this};WorldInputAdapter.prototype.setMouseButtonHandler=function(a,b){this.onMouseButton=util.bind(a,b);return this};WorldInputAdapter.prototype.setMouseMoveHandler=function(a,b){this.onMouseMove=util.bind(a,b);return this};WorldInputAdapter.prototype.setPointerLockChangeHandler=function(a,b){this.onPointerLockChange=util.bind(a,b);return this};WorldInputAdapter.prototype.onKeyInternal_=function(a){this.onKey(a)};
WorldInputAdapter.prototype.onMouseButtonInternal_=function(a){this.onMouseButton(a)};WorldInputAdapter.prototype.onMouseMoveInternal_=function(a){this.onMouseMove(a)};WorldInputAdapter.prototype.onPointerLockChangeInternal_=function(a){this.onPointerLockChange(a)};WorldInputAdapter.prototype.getMovementX=function(a){return a.movementX||a.mozMovementX||a.webkitMovementX||0};WorldInputAdapter.prototype.getMovementY=function(a){return a.movementY||a.mozMovementY||a.webkitMovementY||0};
WorldInputAdapter.prototype.attachEvents=function(){var a=ContainerManager.getInstance().container;a.addEventListener("keydown",util.bind(this.onKeyInternal_,this),!0);a.addEventListener("keyup",util.bind(this.onKeyInternal_,this),!0);a.addEventListener("mousedown",util.bind(this.onMouseButtonInternal_,this),!0);a.addEventListener("mouseup",util.bind(this.onMouseButtonInternal_,this),!0);document.addEventListener("mousemove",util.bind(this.onMouseMoveInternal_,this),!1);document.addEventListener("pointerlockchange",
util.bind(this.onPointerLockChangeInternal_,this));document.addEventListener("mozpointerlockchange",util.bind(this.onPointerLockChangeInternal_,this));document.addEventListener("webkitpointerlockchange",util.bind(this.onPointerLockChangeInternal_,this))};
//@ sourceMappingURL=rootworld.js.map