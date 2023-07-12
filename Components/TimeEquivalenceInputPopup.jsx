import useStore from '@/store/useStore';
import { useState } from 'react';
import {sendTimeEqData} from './ApiCalls'

const TimeEquivalenceInputPopup = ({mockData=null}) => {

    let walls = [0, 1, 2, 3]
    const convertedPoints = useStore((state) => state.convertedPoints)
    // let openings = [0, 1]
    let obstructions
    let openings
    if (mockData) {
        obstructions = mockData.filter(el => el.comments === 'obstruction')
        openings = mockData.filter(el => el.comments === 'opening')
        console.log("obs openings: ",mockData, obstructions, openings, mockData)
    } else {
        obstructions = convertedPoints.filter(el => el.comments === 'obstruction')
        openings = convertedPoints.filter(el => el.comments === 'opening')        
    }// else convert elements
    // get convertedPoints
    // find obstructions -> num == len -1
    // find openings -> num == len
    // create array of len(walls); all default value; zero to start
    function returnZeroArray(length, content=0) {
        let array = [] 
        for (let i=0; i<length; i++) {
            array.push(content)
        }
        return array

    }
    const [wallProperties, setWallProperties] = useState(returnZeroArray(obstructions[0]["finalPoints"].length - 1, "concrete")) // need floor and ceiling too
    const [openingHeights, setOpeningHeights] = useState(returnZeroArray(openings.length, 1))
    const [floorAndCeilingMaterials, setFloorAndCeilingMaterials] = useState(returnZeroArray(2, "concrete"))

    //  has door when one placed
    function handleClick(e) {
        console.log("wallProperties: ", wallProperties)
        console.log("mockData: ", mockData, convertedPoints)
        // bring floor, wall and ceiling properties together
        let roomComposition = wallProperties
        roomComposition.unshift(floorAndCeilingMaterials[0])
        roomComposition.push(floorAndCeilingMaterials[1])
        let tempData
        if (mockData) {
            tempData = mockData
        } else {
            tempData = convertedPoints
        }
        let returnedData = sendTimeEqData(tempData, roomComposition, openingHeights)
        // close popup -> send api call
        // error each cell
        // change to numbers
        // action calc

    }
    // TODO: join floor to start and ceiling material to end of construction list before sending
    return (
      // todo: loop through obstruction elements between vertices/points
    //   how to add to state object on click
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-hidden">
        <div className="bg-white p-4 rounded-lg shadow-lg text-black overflow-y-auto h-[80vh]">
            <ul>
                <li key={"floorInput"}>
                <h2 className="text-lg font-bold mb-2">Enter Floor Material</h2>
                <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4" value={floorAndCeilingMaterials[0]} onChange={(e) =>
                {const temp = floorAndCeilingMaterials.map((c, i) => {
                    if (i === 0) {
                        return e.target.value
                    } else {
                        return c
                    }
                })
            
                setFloorAndCeilingMaterials(temp) 
                }}/>
                </li>
                <li key={"ceilingInput"}>
                <h2 className="text-lg font-bold mb-2">Enter Ceiling Material</h2>
                <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4" value={floorAndCeilingMaterials[1]} onChange={(e) =>
                {const temp = floorAndCeilingMaterials.map((c, i) => {
                    if (i === 1) {
                        return e.target.value
                    } else {
                        return c
                    }
                })
            
                setFloorAndCeilingMaterials(temp) 
                }}/>
                </li>
            {wallProperties.map((current, index) => {
                return (<>
                <li key={"wallInput"+ index}>
                    {/* plan if first or last */}
                <h2 className="text-lg font-bold mb-2">Enter Wall {index + 1} Material</h2>
                {/* set wall x property on change */}
                <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4" value={wallProperties[index]} onChange={(e) => 
                    {const temp = wallProperties.map((c, i) => {
                        if (i === index) {
                            return e.target.value
                        } else {
                            return c
                        }
                    })
                    setWallProperties(temp)}}/>
                </li>
                </>)
                
            })}
            {openingHeights.map((current, index) => {
                return (<>
                <li key={"opening" + index}>
                    <h2 className="text-lg font-bold mb-2">Enter Opening {index + 1} Height (m)</h2>
                    {/* set wall x property on change */}
                    <input type="text" className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4" value={openingHeights[index]} onChange={(e) => 
                        {const temp = openingHeights.map((c, i) => {
                            if (i === index) {
                                return e.target.value
                            } else {
                                return c
                            }
                        })
                        setOpeningHeights(temp)}}/>

                </li>
                </>)
                
            })}
            </ul>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleClick}>
            Enter
          </button>          
        </div>
      </div>
    );
  };
  
  export default TimeEquivalenceInputPopup;