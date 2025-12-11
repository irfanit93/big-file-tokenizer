
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'node:events';

const words = {};

const tokenEventEmitter = new EventEmitter();

async function readFile(filePath) {
  fs.stat(filePath, async (err, stats) => {
    let dataSize = stats.size;
    let bytesRead = 0;
    if (err) {
      console.error(err);
      return;
    }
  let arr = [], tempStr="";
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const processStr = (value)=>{
            let processedWords = value.split(" ").map((processText)=>processText.replace(/[^A-Za-z0-9]/g,' ')).filter((unfilteredText)=>!(unfilteredText.trim()==""));
        processedWords.map((value)=>{
          const spaced_words = value.split(" ").filter((unfilteredText)=>!(unfilteredText.trim()==""));
          if(spaced_words.length>1){
            return spaced_words.map((tempsw)=>{
              if(words[tempsw.toLowerCase().trim()]==undefined){
                words[tempsw.toLowerCase().trim()]=1;
              }
              else{
                words[tempsw.toLowerCase().trim()]+=1;
              }
              return tempsw;
            });
          }
          else{
          if(words[value.toLowerCase().trim()]==undefined){
            words[value.toLowerCase().trim()]=1;
          }
          else{
            words[value.toLowerCase().trim()]+=1;
          }
          return value;
        }
        });
  }
  try {
    for await (const chunk of readStream) {
      bytesRead+=chunk.length;
      console.clear();
      console.log(((bytesRead/dataSize)*100)+"%");
      arr = chunk.split("\n");
      if(tempStr!=="" && arr[0].startsWith(" ")){
        arr.unshift(tempStr);
      }
      else{
        arr[0] = tempStr+arr[0];
      }
      tempStr = "";
      if(!chunk.endsWith("\n")){
          //split every sentence into words and write all words to file except the last word in last element in array
          //store the last word in a temp string
          tempStr = arr.pop();
      }
      arr.map((value)=>{
        processStr(value);
      });
    }
    console.log('Finished reading the file.');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
    console.log("tempStr",tempStr);
    processStr(tempStr);
    //console.log(words);
    tokenEventEmitter.emit('tokens_count_complete',words);
    tokenEventEmitter.emit('tokens_unique_complete',Object.keys(words));
      //}
    fs.writeFile("unique_tokens.txt", Object.keys(words).join("\n"), (err) => {
      if (err) {
          console.log(err);
      }
    }
    );
      fs.writeFile("tokens_count.txt", JSON.stringify(words), (err) => {
      if (err) {
          console.log(err);
      }
    }
    );
});
}
async function readText(pathToFile){
try {
  const outputFilePath = path.join(process.cwd(), pathToFile);
  await readFile(outputFilePath);
} catch (error) {
  console.error(`Error: ${error.message}`);
}

}
export default readText;

export {
  tokenEventEmitter
};
