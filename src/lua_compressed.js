/*

 Visual Blocks Language

 Copyright 2016 Google Inc.
 https://developers.google.com/blockly/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var Blockly={};Blockly.Lua=new Blockly.Generator("Lua");Blockly.Lua.addReservedWords("_,__inext,assert,bit,colors,colours,coroutine,disk,dofile,error,fs,fetfenv,getmetatable,gps,help,io,ipairs,keys,loadfile,loadstring,math,native,next,os,paintutils,pairs,parallel,pcall,peripheral,print,printError,rawequal,rawget,rawset,read,rednet,redstone,rs,select,setfenv,setmetatable,sleep,string,table,term,textutils,tonumber,tostring,turtle,type,unpack,vector,write,xpcall,_VERSION,__indext,HTTP,and,break,do,else,elseif,end,false,for,function,if,in,local,nil,not,or,repeat,return,then,true,until,while,add,sub,mul,div,mod,pow,unm,concat,len,eq,lt,le,index,newindex,call,assert,collectgarbage,dofile,error,_G,getmetatable,inpairs,load,loadfile,next,pairs,pcall,print,rawequal,rawget,rawlen,rawset,select,setmetatable,tonumber,tostring,type,_VERSION,xpcall,require,package,string,table,math,bit32,io,file,os,debug");
Blockly.Lua.ORDER_ATOMIC=0;Blockly.Lua.ORDER_HIGH=1;Blockly.Lua.ORDER_EXPONENTIATION=2;Blockly.Lua.ORDER_UNARY=3;Blockly.Lua.ORDER_MULTIPLICATIVE=4;Blockly.Lua.ORDER_ADDITIVE=5;Blockly.Lua.ORDER_CONCATENATION=6;Blockly.Lua.ORDER_RELATIONAL=7;Blockly.Lua.ORDER_AND=8;Blockly.Lua.ORDER_OR=9;Blockly.Lua.ORDER_NONE=99;
Blockly.Lua.init=function(a){Blockly.Lua.blockNums=0;Blockly.Lua.blockNum=[];Blockly.Lua.blockId=[];Blockly.Lua.definitions_=Object.create(null);Blockly.Lua.functionNames_=Object.create(null);Blockly.Lua.variableDB_?Blockly.Lua.variableDB_.reset():Blockly.Lua.variableDB_=new Blockly.Names(Blockly.Lua.RESERVED_WORDS_)};
Blockly.Lua.finish=function(a){var c=[],d;for(d in Blockly.Lua.definitions_)c.push(Blockly.Lua.definitions_[d]);delete Blockly.Lua.definitions_;delete Blockly.Lua.functionNames_;Blockly.Lua.variableDB_.reset();return c.join("\n\n")+"\n\n\n"+a};Blockly.Lua.scrubNakedValue=function(a){return"local _ = "+a+"\n"};Blockly.Lua.quote_=function(a){a=a.replace(/\\/g,"\\\\").replace(/\n/g,"\\\n").replace(/'/g,"\\'");return"'"+a+"'"};
Blockly.Lua.scrub_=function(a,c){var d="";if(!a.outputConnection||!a.outputConnection.targetConnection){var e=a.getCommentText();(e=Blockly.utils.wrap(e,Blockly.Lua.COMMENT_WRAP-3))&&(d+=Blockly.Lua.prefixLines(e,"-- ")+"\n");for(var b=0;b<a.inputList.length;b++)a.inputList[b].type==Blockly.INPUT_VALUE&&(e=a.inputList[b].connection.targetBlock())&&(e=Blockly.Lua.allNestedComments(e))&&(d+=Blockly.Lua.prefixLines(e,"-- "))}b=a.nextConnection&&a.nextConnection.targetBlock();b=Blockly.Lua.blockToCode(b);
return d+c+b};Blockly.Lua.inTryBlock=function(a){for(a=a.previousConnection;a;)if(a=a.targetBlock()){if("exception_try"==a.type)return!0;a=a.previousConnection}return!1};Blockly.Lua.blockStart=function(a,c){return Blockly.Lua.developerMode?Blockly.Lua.indent(a,"wcBlock.blockStart("+Blockly.Lua.blockIdToNum(c.id)+")")+"\n":""};Blockly.Lua.blockEnd=function(a,c){return Blockly.Lua.developerMode?Blockly.Lua.indent(a,"wcBlock.blockEnd("+Blockly.Lua.blockIdToNum(c.id)+")")+"\n":""};
Blockly.Lua.blockError=function(a,c){var d;return Blockly.Lua.developerMode?d=""+(Blockly.Lua.indent(a,"wcBlock.blockError("+Blockly.Lua.blockIdToNum(c.id)+", err, message)")+"\n"):""};
Blockly.Lua.tryBlock=function(a,c,d,e){var b="";Blockly.Lua.blockIdToNum(c.id);"undefined"==typeof e&&(e="");""!=e&&(b+="-- begin: "+e+"\n");!Blockly.Lua.developerMode||Blockly.Lua.inTryBlock(c)?b+=Blockly.Lua.indent(a,d):(b+=Blockly.Lua.indent(0,"try(")+"\n",b+=Blockly.Lua.indent(1,"function()")+"\n",""!=d&&(b+=Blockly.Lua.indent(2,d)),b+=Blockly.Lua.indent(1,"end,")+"\n",b+=Blockly.Lua.indent(1,"function(where, line, err, message)")+"\n",b+=Blockly.Lua.blockError(2,c),b+=Blockly.Lua.indent(1,"end")+
"\n",b+=Blockly.Lua.indent(0,")"),b=Blockly.Lua.indent(a,b)+"\n");""!=e&&(b+="-- end: "+e+"\n");c.nextConnection&&c.nextConnection.targetBlock()&&(b+="\n");return b};Blockly.Lua.require=function(a){-1==codeSection.require.indexOf('require("'+a+'")')&&codeSection.require.push('require("'+a+'")')};Blockly.Lua.indent=function(a,c){for(var d=0;d<a;d++)c=Blockly.Lua.prefixLines(c,Blockly.Lua.INDENT);return c};
Blockly.Lua.blockIdToNum=function(a){"undefined"==typeof Blockly.Lua.blockNum[a]&&(Blockly.Lua.blockNums+=1,Blockly.Lua.blockNum[a]=Blockly.Lua.blockNums,Blockly.Lua.blockId[Blockly.Lua.blockNums]=a);return Blockly.Lua.blockNum[a]};Blockly.Lua.numToBlockId=function(a){return Blockly.Lua.blockId[a]};
