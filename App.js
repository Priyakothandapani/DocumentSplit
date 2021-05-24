import React, { useState, useMemo, useCallback, useEffect } from 'react'
// Import the main component
import { Viewer } from '@react-pdf-viewer/core'; // install this library
// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'; // install this library
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Worker
import { Worker } from '@react-pdf-viewer/core'; // install this library
//Split PDF
import { PDFDocument } from 'pdf-lib'
//For plus and minus icons
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";

import { AiOutlineClose } from "react-icons/ai";
//For model
import { Modal } from '@fluentui/react';
//For upload
import { useDropzone } from 'react-dropzone';
//For BeatLoader
import { BeatLoader } from 'react-spinners'
//Covert Pdf to image to show Preview
import pdfjsLib from 'pdfjs-dist/webpack';
pdfjsLib.workerSrc = "../node_modules/pdfjs-dist/build/pdf.worker.js"

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#0b97d4',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  transition: 'border .3s ease-in-out'
};

const activeStyle = {
  borderColor: '#0b97d4'
};

const acceptStyle = {
  borderColor: '#0b97d4'
};

const rejectStyle = {
  borderColor: '#0b97d4'
};
export const App = () => {
  // for onchange event in upload file
  const [pdfFile, setPdfFile] = useState(null);
  // for selected file css change
  // const [isSelected, setisSelected]=useState(false);
  // for submit event
  const [viewPdf, setViewPdf] = useState([]);
  //Spliting range
  const [selectedRange, setSelectedRange] = useState('')
  // onchange event

  //loading function
  const [loading, setloading] = useState(false)

  //send file to upload
  const [splittedfiles, setSplittedfile] = useState(null);
  const [inputList, setInputList] = useState([{ pageNumbers: null,fileName:null }]);

  //to open model
  const [isModalOpen, setModel] = useState(false);
  //Model Input
  const [modelinput, setModelinput] = useState(null);

  const [isFileNamemodelOpen,setFileNameModel]=useState(null)
  const fileType = ['application/pdf'];

  const handlePdfFileChange = (e) => {
    let selectedFile = e.target.files[0];
    setloading(true);
    convertPdfToImages(selectedFile)

  }
  const onDrop = useCallback(acceptedFiles => {

    let selectedFile = acceptedFiles[0];
    setloading(true);
    convertPdfToImages(selectedFile)

    console.log(acceptedFiles);
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: '.pdf'
  });


  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  // handle input change
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
    handleselectedpdfPage(list)
    console.log(list);
    console.log(inputList);
  };

  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
    if (list.length > 0) {
      handleselectedpdfPage(list)
    }
    console.log(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, { pageNumbers: null }]);
  };

  // const handleselectedPage = (list) => {

  //   setSelectedRange(list)
  //   if (list.length > 0) {
  //     for (let i = 0; i < list.length; i++) {
  //       if (list[i].pageNumbers.length > 0) {
  //         let splitedPdfPagesrange = list[i].pageNumbers.split(',')
  //         if (splitedPdfPagesrange.length > 0) {
  //           let pdfpages = []
  //           let previewimage = viewPdf;
  //           for (let i = 0; i < splitedPdfPagesrange.length; i++) {
  //             pdfpages = splitedPdfPagesrange[i].split('-');
  //             let startpage = 0;
  //             let endpage = 0;
  //             if (pdfpages.length == 2) {
  //               startpage = pdfpages[0] - 1
  //               endpage = pdfpages[1] - 1
  //             }
  //             else if (pdfpages.length == 1) {
  //               startpage = pdfpages[0] - 1
  //               endpage = pdfpages[0] - 1
  //             }
  //             for (let i = startpage; i <= endpage; i++) {
  //               previewimage = previewimage.map((images) => {
  //                 if (i == images.imagesindex) {
  //                   return { ...images, isSelected: true }
  //                 }
  //                 return images

  //               })

  //             }
  //             setViewPdf(previewimage)
  //           }

  //         }
  //       }
  //       else {
  //         let previewimage = viewPdf;
  //         previewimage = previewimage.map((images) => {
  //           return { ...images, isSelected: false }
  //         })
  //         setViewPdf(previewimage)
  //       }
  //     }
  //   }
  // }
  
  const handleselectedpdfPage =(list)=>
  {
    setSelectedRange(list)
    if (list.length > 0) {
      let pdfpages = [];
      let selectedpdfpages=[];
      let previewimage = viewPdf;
      previewimage = previewimage.map((images) => {
        return { ...images, isSelected: false }
      })
      for (let i = 0; i < list.length; i++) {
        if (list[i].pageNumbers.length > 0) {
          let splitedPdfPagesrange = list[i].pageNumbers.split(',')
          if (splitedPdfPagesrange.length > 0) {
            for (let i = 0; i < splitedPdfPagesrange.length; i++) {
              pdfpages = splitedPdfPagesrange[i].split('-');
              let startpage = 0;
              let endpage = 0;
              if (pdfpages.length == 2) {
                startpage = pdfpages[0] - 1
                endpage = pdfpages[1] - 1
                for(let i=startpage;i<=endpage;i++)
                {
                  selectedpdfpages.push(i)
                }
              }
              else if (pdfpages.length == 1) {
                startpage = pdfpages[0] - 1
                selectedpdfpages.push(startpage);
              }
            }

          }
        }
        else {
          let previewimage = viewPdf;
          previewimage = previewimage.map((images) => {
            return { ...images, isSelected: false }
          }, setViewPdf(previewimage))
          setViewPdf(previewimage)
        }
      }
      for (let i =0; i <selectedpdfpages.length; i++) {
        previewimage = previewimage.map((images) => {
          if (selectedpdfpages[i] == images.imagesindex) {
            return { ...images, isSelected: true }
          }
          return images;
        })
        setViewPdf(previewimage)
      }
     
    }
  }


  async function SplitPdfintoMultipleFile() {
    let selectedrange = inputList
    for (let i = 0; i < selectedrange.length; i++) {
      let splitedPdfPagesrange = selectedrange[i].pageNumbers.split(',')
      let fileName=selectedrange[i].fileName
      setViewPdf(viewPdf)
      //Reading pdf from pdf base64
      const pdfDoc = await PDFDocument.load(pdfFile);
      //getting number of pages in uploaded pf
      const numberOfPages = pdfDoc.getPages().length;
      //getting pages
      const Pages = pdfDoc.getPages();
      const splittedpdf = [];
      const subDocument = await PDFDocument.create();
      for (let i = 0; i < splitedPdfPagesrange.length; i++) {
        let pdfpages = []
        pdfpages = splitedPdfPagesrange[i].split('-');
        let startpage = 0;
        let endpage = 0;
        if (pdfpages.length == 2) {
          startpage = pdfpages[0] - 1
          endpage = pdfpages[1] - 1
        }
        else if (pdfpages.length == 1) {
          startpage = pdfpages[0] - 1
          endpage = pdfpages[0] - 1
        }
        const byteofpages = []

        for (let j = startpage; j <= endpage; j++) {
          const [copiedPage] = await subDocument.copyPages(pdfDoc, [j])
          subDocument.addPage(copiedPage);
        }

      }
      const pdfBytes = await subDocument.save();
      var blob = new Blob([pdfBytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      const base64frombyte = btoa(pdfBytes)
      //const base64frombyte=  new Uint8Array(pdfBytes)
      splittedpdf.push({ preview: url, base64: base64frombyte })
      console.log(url);
      console.log(splittedpdf)
      let tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName+'.pdf');
      tempLink.click();
      setSplittedfile(splittedpdf)
    }
  }
  // const SelectImage = (e)=>
  // {
  //    const selected=e.target.value
  //    let previewimage=viewPdf;

  //    previewimage = previewimage.map((images) => {
  //       if(selected==images.imagesindex)
  //       {
  //         return {...images, isSelected: true}
  //       }
  //       return images
  //   })


  //    setViewPdf(previewimage)

  // }
  async function extractpdf() {
    let selectedrange = inputList

    //let splitedPdfPagesrange=selectedrange[i].pageNumbers.split(',')
    //setViewPdf(viewPdf)
    //Reading pdf from pdf base64
    const pdfDoc = await PDFDocument.load(pdfFile);
    //getting number of pages in uploaded pf
    const numberOfPages = pdfDoc.getPages().length;
    //getting pages
    const Pages = pdfDoc.getPages();
    const splittedpdf = [];

    const byteofpages = []
    const subDocument = await PDFDocument.create();
    for (let i = 0; i < selectedrange.length; i++) {
      const index = selectedrange[i]
      const [copiedPage] = await subDocument.copyPages(pdfDoc, [index])
      subDocument.addPage(copiedPage);
    }
    const pdfBytes = await subDocument.save();
    var blob = new Blob([pdfBytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    const base64frombyte = btoa(pdfBytes)
    //const base64frombyte=  new Uint8Array(pdfBytes)
    splittedpdf.push({ preview: url, base64: base64frombyte })
    console.log(url);
    console.log(splittedpdf)

    setSplittedfile(splittedpdf)
  }
  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
        setPdfFile(e.target.result)
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  };
  const convertPdfToImages = async (file) => {
    const images = [];
    const data = await readFileData(file)
    const pdf = await pdfjsLib.getDocument(data).promise;
    const canvas = document.createElement("canvas");
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      images.push(canvas.toDataURL());
    }
    canvas.remove();
    //setViewPdf(images)
    setViewPdf(images.map((file, i) => ({
      previewimages: file,
      imagesindex: i,
      isSelected: false
    })))
    setloading(false);
  }

  const handlepreviewimage = (file, fileindex) => {
    // const list = inputList;
    // list.push(fileindex)
    // setInputList(list);
    // let previewimage=viewPdf;
    // previewimage = previewimage.map((images) => {
    //   if(fileindex==images.imagesindex)
    //   {
    //     return {...images, isSelected: true}
    //   }
    //   return images
    //   })
    //  setViewPdf(previewimage)
    //  console.log(list)
    setModelinput(file)
    setModel(true)
  }
  const FileNameGeneration =()=>{
    setFileNameModel(true);
  }
  const hideModal = () => {
    setModel(false)
  }
  const hideFileNameModal =()=>{
    setFileNameModel(false);
  }
  const thumbs = viewPdf.map((file, i) => (
    <div className="previewgrid">
      <li key={i} className={file.isSelected ? 'selectedPage' : 'unselectedpage'}>
        <img key={i} className="previewimgclass" src={file.previewimages} onClick={() => handlepreviewimage(file.previewimages, file.imagesindex)} alt="Red dot"></img>
        <div class="pagenumber">{i + 1}</div>
      </li>
    </div>
  ));

  return (
    <div className='pdfsplitcontainer'>

      <div className='pdfbrowsesection' {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <div className='file-upload'>
          <p>Drag and drop your files here  or</p>
          <p>Browse a files to upload</p>
        </div>
      </div>
      {viewPdf.length>0&&!loading?
        <div id="previewsection">
         <div className='pdf-container'>
            {viewPdf.length>0&&thumbs}
          </div>

          <div className="bottom">
            {inputList.map((x, i) => {
              return (

                <div className="leftbox">

                  <input
                    className="selectionrange"
                    name="pageNumbers"
                    placeholder="Enter pageNumbers"
                    value={x.pageNumbers}
                    onChange={e => handleInputChange(e, i)}
                  />

                  {inputList.length !== 1 && <FaMinusCircle
                    className="plusMinusButton"
                    onClick={() => handleRemoveClick(i)}>Remove</FaMinusCircle>}
                  {inputList.length - 1 === i && <FaPlusCircle className="plusMinusButton" onClick={handleAddClick}>Add</FaPlusCircle>}

                </div>

              );
            })
            
            }

            <button className='btn btn-success btn-lg splitbutton' onClick={FileNameGeneration}>Split</button>
          </div>
          <br></br>
        </div>
         :<div>
           {loading&&
          <div className="browsesection">
            <div className="custom-file-upload">
              <BeatLoader color={"#795fbf "} loading={loading} className="override" size={30}></BeatLoader>
            </div>
          </div>}
          </div>
          }
        
        
        
      {<Modal className='modalclass' isOpen={isModalOpen} >
        <div>
          <AiOutlineClose className='closeicon' onClick={hideModal}></AiOutlineClose>
        </div>

        <img src={modelinput}></img>
      </Modal>}
      {<Modal className='modalclass' isOpen={isFileNamemodelOpen} >
        <div>
          <AiOutlineClose className='closeicon' onClick={hideFileNameModal}></AiOutlineClose>
        </div>
        <div className="bottom">
          <span className='extractfiles'><center>Extract your files</center></span>
            {inputList.map((x, i) => {
              
              return (
<div>
                <div className="fileNameModel">
                  <input
                    className="selectionrange"
                    name="pageNumbers"
                    placeholder="Enter pageNumbers"
                    value={x.pageNumbers}
                    disabled={true}
                    onChange={e => handleInputChange(e, i)}
                  />
                  <span>__</span>
                  <input
                    className="selectionrange"
                    name="fileName"
                    placeholder="Enter FileName"
                    value={x.fileName}
                    onChange={e => handleInputChange(e, i)}
                  />
                   
                </div>
                <br></br>
                </div>
              );
             
            })
           
            }
             <br></br>
            <button className='btn  btn-lg downloadbutton' onClick={SplitPdfintoMultipleFile}>Download</button>
          </div>
        
      </Modal>}
      
    </div>
  )
}

export default App
