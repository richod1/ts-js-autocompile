import * as chokidar from "chokidar";
import * as ts from "typescript"
import * as path from "path"
import {Command} from "commander"
import {promisify} from 'util'
import * as fs from "fs"

const program=new Command();

program
    .option('-s.--src <directory>','Source directory containing Typescript files','src')
    .option('-d,--dist <directory>','Destination directory for the compilation of JavaSript files','dist')
    .parse(process.argv);

/**raised error */
// const srcDir=program.src;
// const distDir=program.dist;
const {src:srcDir,dist:distDir}=program.opts();

const readdir=promisify(fs.readdir);
const stat=promisify(fs.stat);

async function compileAllFiles(dir:string){
    const files=await readdir(dir)

    for(const file of files){
        const filePath=path.join(dir,file);
        const fileStat=await stat(filePath);

        // base condition
        if(fileStat.isDirectory()){
            await compileAllFiles(filePath)

        }else if(file.endsWith('.ts')){
            compileAllFiles(filePath)
        }

    }
}

const watcher=chokidar.watch(srcDir,{ignoreInitial:true})

console.log(`Watching ${srcDir} for changes...`);

watcher.on('add',compileAllFiles)
watcher.on('change',compileAllFiles)


function compileFile(filePath:string){
    const outFile=path.join(distDir,path.relative(srcDir,filePath).replace(/\.ts$/,'.js'))
    const tsConfig=ts.readConfigFile('tsconfig.json',ts.sys.readFile).config;
    const compileOptions=ts.parseJsonConfigFileContent(tsConfig,ts.sys,path.dirname(filePath));

    const program=ts.createProgram([filePath],compileOptions.options);
    const emitResult=program.emit();

    if(emitResult.emitSkipped){
        console.log(`Error compiling ${filePath}`)
    }else{
        console.log(`Compiled ${filePath} to ${outFile}`)
    }
}
