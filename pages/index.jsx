import Image from 'next/image';
import Canvas from '../Components/Canvas'
import { useEffect, useRef, useState } from 'react'
import FDRobot from '../Components/FDRobot'
import useStore from '../store/useStore'
import { saveAs } from 'file-saver';


  /**Features:
   * user selects pdf image  
   * pdf added to background
   * user can draw polyline
   * gridlines arbitrary 
   * allow user to configure scale -> distance between two points
   * gridlines to be calculated from scale
   * allow mesh rectangles to be drawn
   * ctrl for ortho lines
   * points can be drawn
   * 
   * TODO: 
   * test download of data as .fds file from frontend
   * send elements as param to fastapi
   * allow naming of elements from list or similar to differentiate
   * 
   * FUTURE: 
   * migrate state to zustand
   * perhaps allow rotation of pdf?
   * 
   * 
   */
const server_urls = {
  "localhost": 'http://127.0.0.1:8000',
  "server": 'https://fdsbackend-1-r7337380.deta.app'
}
// need scale also
const testElements = [
  {
    "type": "polyline",
    "points": [
        {
            "x": 234.58699702156903,
            "y": 1418.6927915113936
        },
        {
            "x": 497.1010174980868,
            "y": 1418.6927915113936
        },
        {
            "x": 497.1010174980868,
            "y": 1329.3263164555578
        },
        {
            "x": 234.58699702156903,
            "y": 1329.3263164555578
        },
        {
            "x": 234.58699702156903,
            "y": 1418.6927915113936
        }
    ],
    "comments": "obstruction"
},
{
  "type": "rect",
  "points": [
      {
          "x": 184.3183548026614,
          "y": 1156.178771034876
      },
      {
          "x": 441.24697058818936,
          "y": 1301.399293000609
      }
  ],
  "comments": "mesh"
},
{
  "type": "polyline",
  "points": [
      {
          "x": 2287.6247440522234,
          "y": 1238.4133952763916
      },
      {
          "x": 2483.7068649709854,
          "y": 1238.4133952763916
      },
      {
          "x": 2483.7068649709854,
          "y": 1324.4143255039187
      },
      {
          "x": 2287.6247440522234,
          "y": 1324.4143255039187
      },
      {
          "x": 2287.6247440522234,
          "y": 1238.4133952763916
      }
  ],
  "comments": "stairObstruction"
},
{
  "type": "rect",
  "points": [
      {
          "x": 2287.6247440522234,
          "y": 1238.4133952763916
      },
      {
          "x": 2483.7068649709854,
          "y": 1324.4143255039187
      }
  ],
  "comments": "stairMesh"
},
{
  "type": "rect",
  "points": [
      {
          "x": 2291.0647812613242,
          "y": 1238.4133952763916
      },
      {
          "x": 2352.985451025144,
          "y": 1324.4143255039187
      }
  ],
  "comments": "stairLanding"
},
{
  "type": "rect",
  "points": [
      {
          "x": 2435.54634404357,
          "y": 1241.8534324854927
      },
      {
          "x": 2480.266827761884,
          "y": 1320.9742882948176
      }
  ],
  "comments": "stairHalfLanding"
},
{
  "type": "point",
  "points": [
      {
          "x": 2356.425488234245,
          "y": 1303.7741022493124
      }
  ],
  "comments": "stairClimb"
},

]

// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Only import pdfjs if we're in the browser
let pdfjs;
if (isBrowser) {
  // pdfjs = require('pdfjs-dist/build/pdf');
  pdfjs = require('pdfjs-dist/webpack');

  // Set the workerSrc
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export default function Home() {
  let dev_mode = true
  // states for uploading file
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [selectedFile, setSelectedFile] = useState()
  const [ canvasDimensions, setCanvasDimensions ] = useState({})
  const [comment, setComment] = useState("")
  const [ fdsData, setFdsData] = useState("")
  const pdfCanvasRef = useRef()

  const [tool, setTool] = useState("scale")
  const elements = useStore((state) => state.elements)

  console.log("elements log: ", elements)
  // const setElements = useStore((state) => state.setElements)

  // useEffect(() => {
  //   const sendElementData = async () => {
  //     // console.log("body: ", JSON.stringify({ elements }))
  //     const response = await fetch('http://127.0.0.1:8000/test', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ testElements }),
  //     });
    
  //     const data = await response.json();
  //     console.log("data received: ", data)
    
  //     return data;
    
  //   }
  //   sendElementData()
  // }, [])
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file && pdfCanvasRef.current) {
      const loadPdf = async () => {
        const pdfjs = await import('pdfjs-dist/build/pdf');

        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        loadingTask.promise.then((pdf) => {
          const pageNumber = 1;
          pdf.getPage(pageNumber).then((page) => {
            const canvas = pdfCanvasRef.current;
            const context = canvas.getContext('2d');

            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            setCanvasDimensions({ width: canvas.width, height: canvas.height });

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            const renderTask = page.render(renderContext);
            renderTask.promise.then(() => {
              console.log('Page rendered');
            });
            setSelectedFile(true);
          });
        });
      };

      loadPdf();
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
  };

  const handleDownload = () => {
    // need data as state
    // const fdsData = dummy_fds
    if (fdsData) {

      const blob = new Blob([fdsData], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "test.fds");
    }
  }
 


  const sendElementData = async () => {
    let elements = testElements
    let bodyContent = JSON.stringify( elements )
    console.log("body: ", bodyContent)
    const response = await fetch(`${server_urls.localhost}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: bodyContent,
    });
  
    const data = await response.json();
    console.log("data received: ", data)
    setFdsData(data)
    return data;
  
  }
  // const sendElementData = () => {
  //   const options = {
  //     method: 'POST',
  //     url: 'http://127.0.0.1:8000/test',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ elements }),
  //   };
  
  //   return fetch(options).then((response) => {
  //     if (response.status === 200) {
  //       return response.json();
  //     } else {
  //       throw new Error(`API returned an error with status code ${response.status}`);
  //     }
  //   });
  // };

  const topButtons = (          
    <>
    {/* 
     * obstruction, mesh, 
      * if stair -> landing, half landing, 
      * if point & stair-> point for stair climb
      * if point & not stair -> fire (can be centre of box), inlet (can be polyline with two points)  
      * doors to be lines
    */}
    {/* <div className='absolute z-10 z-30'> */}
  
          {/* <input
            type="radio"
            id="selection"
            checked={tool === "selection"}
            onChange={() => setTool("selection")}
          /> */}
          {/* <label htmlFor="selection">Selection</label> */}
          {/* non stair obstructions */}
          <input type="radio" id="line" checked={tool === "polyline" && comment == 'obstruction'} onChange={() => {
            setTool("polyline")
            setComment("obstruction")
            }} />
          <label htmlFor="line">Obstruction</label>
          {/* non stair mesh */}
          <input
            type="radio"
            id="mesh"
            checked={tool === "rect" && comment=== "mesh"}
            onChange={() => {
              setTool("rect") 
              setComment("mesh")
            }}
          />
          <label htmlFor="rectangle">Mesh</label>
          {/* stair obstructions */}
          <input type="radio" id="line" checked={tool === "polyline" && comment == 'stairObstruction'} onChange={() => {
            setTool("polyline")
            setComment("stairObstruction")
            }} />
          <label htmlFor="line">Stair Obstruction</label>
          {/* stair mesh */}
          <input
            type="radio"
            id="mesh"
            checked={tool === "rect" && comment=== "stairMesh"}
            onChange={() => {
              setTool("rect") 
              setComment("stairMesh")
              sendElementData()
            }}
          />
          <label htmlFor="rectangle">Stair Mesh</label>
          {/* stair landing */}
          <input
            type="radio"
            id="mesh"
            checked={tool === "rect" && comment=== "stairLanding"}
            onChange={() => {
              setTool("rect") 
              setComment("stairLanding")
              sendElementData()
            }}
          />
          <label htmlFor="rectangle">Stair Landing</label>
          {/* stair half landing */}
          <input
            type="radio"
            id="mesh"
            checked={tool === "rect" && comment=== "stairHalfLanding"}
            onChange={() => {
              setTool("rect") 
              setComment("stairHalfLanding")
              sendElementData()
            }}
          />
          <label htmlFor="rectangle">Stair Half-landing</label>
          {/* Point  
                * if point & stair-> point for stair climb
                * if point & not stair -> fire (can be centre of box), inlet (can be polyline with two points)
                * stairClimb
          */}
          {/* optional stair climb */}
          <input
            type="radio"
            id="fire"
            checked={tool === "point"}
            onChange={() => {
              setTool("point")
              setComment("stairClimb")
            }}
          />
          <label htmlFor="fire">Stair Climb</label>
          {/* fire */}
          <input
            type="radio"
            id="fire"
            checked={tool === "point"}
            onChange={() => {
              setTool("point")
              setComment("fire")
            }}
          />
          <label htmlFor="fire">Fire</label>

    {/* </div> */}
    </>
    )

  const menuOverlay = (<>
<div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-30 h-5vh" onClick={handleButtonClick}>
  <svg
    className="w-full h-1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    style={{ zIndex: -1 }}
  >
    <polygon
      points="0 0 1440 0 1440 120"
      className="fill-current bg-gray-900"
    />
    <polygon
      points="1440 0 0 0 0 120"
      className="fill-current bg-gray-800"
    />
  </svg>
  <div className="flex justify-center py-4 relative absolute z-30" style={{ zIndex: 100 }} >
    {topButtons}
  </div>
</div>

    </>
)



  return (
    <>
      {/* TODO: have label disappear when file uploaded */}
      {tool != "scale" ? (<>
      {menuOverlay} 
      </>
      )
      :null}
      

      <div>
        { selectedFile ? (<>
          <Canvas 
            tool={tool} 
            setTool={setTool} 
            dimensions={canvasDimensions} 
            isDevMode={dev_mode} 
            comment={comment} 
            setComment={setComment}
            />
        </>
        ) : 
            <>
      <div>
        <label>
          <input 
            id="image"
            name="image"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </label>
        <button 

        onClick={sendElementData}
        >Test API</button>
        <button
          onClick={handleDownload}
        >
          Test download fds file
        </button>


      </div>
              <FDRobot hintText={'Please upload PDF'} />
            </>
              
              }
        <canvas 
        ref={pdfCanvasRef}
        className='z-1'
        // onClick={sendElementData()}
        />
      </div>
    </>
)
}


