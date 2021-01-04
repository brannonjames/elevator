module.exports = {
  floorButtonsPressedOnFloor: [],
  init(elevators, floors) {
    const topFloor = floors[floors.length - 1];
    //
    elevators.forEach(elevator => {
      //
      this.addFloorListeners(floors);
      this.addElevatorListeners(elevator, topFloor.level);

      // go to the very top right away - don't worry we'll make stops along the way!
      elevator.goToFloor(topFloor.level);
    });
  },
  addFloorListeners(floors) {
    // add listeners to each floor
    floors.forEach(floor => {
      //
      floor.on("up_button_pressed", () => {
        console.log(`UP BUTTON PRESSED ON FLOOR ${floor.level}`);
        // Push floor into globql list that any elevator can stop if if it's going in the direction the user wants to go
        this.floorButtonsPressedOnFloor.push({
          floorNum: floor.level,
          direction: 'up'
        });
      });
      //
      floor.on("down_button_pressed", () => {
        console.log(`DOWN BUTTON PRESSED ON FLOOR ${floor.level}`);
        // Push floor into globql list that any elevator can stop if if it's going in the direction the user wants to go
        this.floorButtonsPressedOnFloor.push({
          floorNum: floor.level,
          direction: 'down'
        });
      });
      //
    });
    //
  },
  addElevatorListeners(elevator, topFloorLevel) {
    //
    elevator.on("passing_floor", (floorNum, direction) => {
      //
      console.log(`PASSING FLOOR ${floorNum} GOING ${direction}`);
      //
      const floorButtonWasPressedInElevator = elevator.getPressedFloors().includes(floorNum);
      const floorButtonWasPressedOnFloorWithDirection = this.floorButtonsPressedOnFloor.filter(floorObj => floorObj.direction === direction).some(floorObj => floorObj.floorNum === floorNum);
      //
      // When coming up on a floor with we check a couple things...
      // ...If someone on in the elevator wants to get off there, we stop
      if (floorButtonWasPressedInElevator) {
        console.log(`PRESSED ELEVATOR FLOOR - STOPPING`);
        elevator.goToFloor(floorNum, true);

        // ... If someone on the floor wants to go in the direction we're going, we stop 
      } else if (floorButtonWasPressedOnFloorWithDirection) {
        console.log(`PRESSED FLOOR BUTTON - STOPPING`);
        elevator.goToFloor(floorNum, true);
        // We stopped here so remove floor from global list (until someone pressed a button again)
        this.floorButtonsPressedOnFloor = this.floorButtonsPressedOnFloor.filter(
          floorObj =>
            floorObj.floorNum !== floorNum && floorObj.direction !== direction
        );
      }
    });
    //
    elevator.on("stopped_at_floor", floorNum => {
      //
      this.removeFloorFromFloorButtonPressedList(floorNum);
      //
      // constantly move from top floor to bottom floor - we stop at the appropiate floors on the way
      if (floorNum === topFloorLevel) {
        elevator.goToFloor(0);
      } else if (floorNum === 0) {
        elevator.goToFloor(topFloorLevel);
      }
    });
  },
  //
  // remove floors from list when we arrive there so we don't stop there again unneccarsarily
  removeFloorFromFloorButtonPressedList(floorNum) {
    this.floorButtonsPressedOnFloor = this.floorButtonsPressedOnFloor.filter(floorObj => floorObj.floorNum !== floorNum);
  },
  //
  update(dt, elevators, floors) {}
}
