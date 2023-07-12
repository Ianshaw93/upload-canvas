import {mockRadiationElements, mockTimeEqElements} from '../utils/mockData'

const server_urls = {
    "localhost": 'http://127.0.0.1:8000',
    "server": 'https://fdsbackend-1-r7337380.deta.app'
  }

//   feed in input box contents
export const sendTimeEqData = async (elementList, roomComposition=null, openingHeights=null) => {
    let convertedPoints = elementList
    let obstructions = elementList.filter(el => el.comments === 'obstruction')
    let openings = elementList.filter(el => el.comments === 'opening')
    // find number of walls
    function returnZeroArray(length, content=0) {
      let array = [] 
      for (let i=0; i<length; i++) {
          array.push(content)
      }
      return array

  }
    // to send
    // 
    if (!roomComposition) {
        roomComposition = returnZeroArray(obstructions[0]['finalPoints'].length + 2, "concrete")
    }
    if (!openingHeights) {
        openingHeights = returnZeroArray(openings.length, 1.5)
    }

    let bodyContent = [ convertedPoints, roomComposition ]

    bodyContent = JSON.stringify( {convertedPoints, roomComposition, openingHeights} )
    console.log("body: ", bodyContent)
    const response = await fetch(`${server_urls.localhost}/timeEq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: bodyContent,
    });
    const blob = await response.blob(); // get the image as a blob
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chart.jpeg';
    link.click();

    return true;
  
  }