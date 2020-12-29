        module.exports = {
            floorButtonsPressed: [],
            init(elevators, floors) {
                const elevator = elevators[0]; // Let's use the first elevator
                
                this.addFloorListeners(floors, elevators);
                this.addElevatorListeners(elevator);

                this.onFloorPress(elevator);
                
            },
            onFloorPress(elevator) {
              console.log('============== ON FLOOR PRESS ================');
              console.log(`CURRENT FLOOR: `, elevator.currentFloor());
              console.log(`BUTTONS PRESSED ON FLOOR`, this.floorButtonsPressed);
              //
              const lowerQueuedFloors = this.getAllLowerQueuedFloors(elevator);               
              const upperQueuedFloors = this.getAllUpperQueuedFloors(elevator); 
              //
              // If there are more stops above the current position, start moving up
              if (upperQueuedFloors.length > lowerQueuedFloors.length) {
                console.log(`MORE FLOORS ABOVE CURRENT FLOOR - MOVING UP TO FLOOR ${upperQueuedFloors[0]}`);
                this.goToFloorIfValid(elevator, upperQueuedFloors[0], true);        
              } else {
                console.log(`MORE FLOORS BELOW CURRENT FLOOR - MOVING DOWN TO FLOOR ${lowerQueuedFloors[0]}`);
                this.goToFloorIfValid(elevator, lowerQueuedFloors[0], true);          
              }
              console.log('-------------------------------------------');
            },
            addFloorListeners(floors, elevators) {
              // add listeners to each floor
              floors.forEach(floor => {
                //
                floor.on("up_button_pressed", () => {
                  console.log(`UP BUTTON PRESSED ON FLOOR ${floor.level}`);
                  this.floorButtonsPressed.push({ floorNum: floor.level, direction: 'up' });
                  this.onFloorPress(elevators[0]);
                });
                //
                floor.on("down_button_pressed", () => {
                  console.log(`DOWN BUTTON PRESSED ON FLOOR ${floor.level}`);
                  this.floorButtonsPressed.push({ floorNum: floor.level, direction: 'down' });
                  this.onFloorPress(elevators[0]);
                });
                //
            });
            //
            },
            addElevatorListeners(elevator) {
              //
              elevator.on('passing_floor', (floorNum, direction) => {
                //
                console.log(`PASSING FLOOR ${floorNum} GOING ${direction}`);
                //
                if (elevator.getPressedFloors().includes(floorNum)) {
                  console.log(`PRESSED ELEVATOR FLOOR - STOPPING`);
                  elevator.goToFloor(floorNum, true);
                } else if (this.floorButtonsPressed.filter(floorObj => floorObj.direction === direction).some(floorObj => floorObj.floorNum === floorNum)) {
                  console.log(`PRESSED FLOOR BUTTON - STOPPING`);
                  elevator.goToFloor(floorNum, true);
                  this.floorButtonsPressed = this.floorButtonsPressed.filter(floorObj => floorObj.floorNum !== floorNum && floorObj.direction !== direction);
                }

              });
              //
              elevator.on("floor_button_pressed", (floorNum) => {
                this.onFloorPress(elevator);
              });
              //
              elevator.on('stopped_at_floor', (floorNum) => {
                this.removeFloorFromFloorButtonPressedList(floorNum);          
              });
            //
            },
            //
            // Get all the queued floors below the current elevator position
            // sort by closest to farthest from current position
            getAllLowerQueuedFloors(elevator) {
              const currentFloor = elevator.currentFloor();
              const pressedFloors = elevator.getPressedFloors().filter(floor => floor < currentFloor);
              const waitingFloors = this.floorButtonsPressed.map(floorObj => floorObj.floorNum);
              return pressedFloors
                      .concat(waitingFloors)
                      .sort();
            },  
            //
            // Get all the queued floors above the current elevator position
            // sort by closest to farthest from current position
            getAllUpperQueuedFloors(elevator) {
              const currentFloor = elevator.currentFloor();
              const pressedFloors = elevator.getPressedFloors().filter(floor => floor > currentFloor);
              const waitingFloors = this.floorButtonsPressed.map(floorObj => floorObj.floorNum);
              return pressedFloors
                      .concat(waitingFloors)
                      .sort()
                      .reverse();
            },
            //
            goToFloorIfValid(elevator, floorNum, first = false) {
              if (Number.isInteger(floorNum)) {
                console.log('GOING TO FLOOR: ', floorNum);
                elevator.goToFloor(floorNum, first);
              }
            },
            //
            // remove floors from list when we arrive there so we don't stop there again unneccarsarily 
            removeFloorFromFloorButtonPressedList(floorNum) {
              this.floorButtonsPressed = this.floorButtonsPressed.filter(floorObj => floorObj.floorNum !== floorNum);
            },
            //  
            update(dt, elevators, floors) {
                // We normally don't need to do anything here
            }
        }