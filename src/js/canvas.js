//We can't import images directly from the file system and so need to create some sort of a server to import images from it
//There's a live server extension in VS Code and so a server like localhost:3000 can be rendered easily there; But for Sublime Text, things to be a bit different

//We need to use Canvas Boilerplate to import images into the game
//Then we'll have to copy the entire code of index.js and index.html to mario-game server folder and continue coding there; No need for index.html also actually

import platform from "../Images/platform.png";
//console.log(platform); Here we see that our platform image is correctly made into the game seen through the console
import background from "../Images/background.png";
import hills from "../Images/hills.png";
import platformSmallTall from "../Images/platformSmallTall.png";
import spriteRunLeft from "../Images/spriteRunLeft.png";
import spriteRunRight from "../Images/spriteRunRight.png";
import spriteStandLeft from "../Images/spriteStandLeft.png";
import spriteStandRight from "../Images/spriteStandRight.png";
import youwin from "../Images/You-Win.jpg";
import youlose from "../Images/You-Lose.jpg";

const canvas = document.querySelector("canvas"); //It helps us select a paricular element from html file

const c = canvas.getContext("2d"); //As we create a 2D game, we pass in the argument as a string called 2D

//console.log(canvas); To see if html and js files are connected by using the script tag with src mentioned, we use the console log and we get output on console as canvas too
//console.log(c) - This will even show us that the context is being passed correctly

//canvas.width = window.innerWidth; Actually when a window element is referenced, we can directly write that property instead of specifying window. i.e. we can write canvas.width=innerwidth only
//canvas.height = window.innerHeight;
//Still we see that the canvas element doesn't cover the entire height and width and some margin is given by default to the element

//Making the game responsive is very hard; so we limit the playable area to 16:9 aspect ratio only
canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

//Now to create any character, we need to create a Javascript ES6 class
class Player {
  constructor() {
    this.speed = 7.5;
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0, //In canvas the positive y axis is downwards and so adding a y-velocity of 1 would pull the player downwards, acting like gravity
      //Even if the y velocity is set to 0, it'll increase eventually due to the y acceleration
    };
    this.width = 66; //This is the default value, but it changes when the character runs
    this.height = 150;

    //this.image = createImage(spriteStandRight);
    this.frames = 0; //This will tell us on which frame of the image we're currently on
    this.sprites = {
      //This is an object that defines properties of what our character is doing
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177, //cropWidths for standing and running animations are different
        width: 66,
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875,
      },
    };

    this.currentSprite = this.sprites.stand.right; //This tells us which sprite is currently in use and which to render accordingly and by default it's the stand right position
    this.currentCropWidth = this.sprites.stand.cropWidth;
  } //Whenever a player is created, this Constructor function gets fired and assigns properties to our player
  //Lets first consider making our player as a square, then it'll have properties of an x-position, y-position, width, height and maybe a color

  // draw() {
  //   c.fillStyle = "red";
  //   //fillStyle when written here makes the square red but when written below the fillRect has no effect

  //   //This function is used to draw our player on the canvas
  //   c.fillRect(this.position.x, this.position.y, this.width, this.height); //Now the color of a Player ocreated is black by default
  // }
  //Our player is no longer a red square but the Sprite character
  draw() {
    c.drawImage(
      //By this the character looks really smushed up; But it's ok as we'll extend the drawImage function to crop a part of the image at a time so that the animation effect is created
      //For that we need to add 4 more arguments specifying from where and by how much we need to crop the image
      this.currentSprite,
      this.currentCropWidth * this.frames, //When frames increase continuosly, the width increases by 177 each time and we see the standing Sprite
      0,
      this.currentCropWidth,
      400, //We need crop fro top left corner and by width of 177 as total width =14400 but each's width=177 and height=400; Info got from properties of the image
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (
      this.frames > 59 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    ) {
      //frame rate for standing is 59 and for running is 29
      this.frames = 0;
    } else if (
      this.frames > 29 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    ) {
      this.frames = 0;
    }

    //This function will update the properties of the player like the position, etc.
    this.position.x += this.velocity.x; //The x-velocity of the player needs to be added to the x-position; else it won't move at all
    this.position.y += this.velocity.y; //This line of code should be written above actually to make the player move
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    } //This condition says that only till the bottom of the player reaches the bottom of the canvas, the acceleration works
    // else {
    //   this.velocity.y = 0;
    // } As soon as the player reaches the bottom of the screen, the player stops
    //We don't need this anymore as once the player falls in a death pit, the game ends
    this.draw();
  }
}

class Platform {
  constructor({ x, y, image }) {
    //Can pass image as an argument too
    //Can reference the x and y through the parameters
    //Constructor method of platforms comes handy here as instead of defining the position here, we can pass them as props while making the platform
    this.position = {
      x: x,
      y: y, //When the property and the assigned value are the same, no need to write the :, like here instead of x: x directly write x
    };

    this.image = image;

    this.width = image.width; //Setting the width and height of the platform as the same as that of the image
    this.height = image.height;
  }

  draw() {
    // c.fillStyle = "blue";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    //We can now remove this part of code as we're importing our image now
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}
//To make the player stay on top of platform, we need to use Rectangular Collision detection, which is how to code to see the detection of collision between two rectangular objects

//We need to create a class only for objects we'll be using for the purpose of decoration
class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = image;

    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Message {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = image;

    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// const image = new Image();
// image.src = platform;
// console.log(image); Using this we see that we get an HTML image object which appears at the top
//Once different images come into picture, writing the above code again and again becomes tedious; SO we use a function to create images again and again
function createImage(imageSrc) {
  //Our imageSrc would be the images imported at the top
  const image = new Image();
  image.src = imageSrc;
  return image;
}

//Now to implement this player class, we do:
let player = new Player();
//player.draw();
//We see that eventhought the width and height are the same, the player isn't a square, rather a rectangle and that's because our Canvas element doesn't take up the whole screen as expected
//const platform = new Platform();
//To create multiple platforms, we just place this Platform() method in an array
let platformImage = createImage(platform); //const keywords won't allow us to change the values of these variables upon resetting
let platformSmallTallImage = createImage(platformSmallTall);
const win = createImage(youwin);
const lose = createImage(youlose);
let platforms = [
  // new Platform({ x: -1, y: 470, image: platformImage }),
  // new Platform({ x: platformImage.width - 3, y: 470, image: platformImage }),
  // new Platform({
  //   x: platformImage.width * 2 + 100,
  //   y: 470,
  //   image: platformImage,
  // }),
  // new Platform({ x: platformImage.width - 3, y: 470, image: platformImage }),
]; //Now we can add multiple platforms in this array

let genericObjects = [
  // new GenericObject({
  //   x: -1,
  //   y: -1,
  //   image: createImage(background),
  // }),
  // new GenericObject({
  //   x: -1,
  //   y: -1,
  //   image: createImage(hills),
  // }),
]; //No objects created initially; only on calling init(), the objects will be created and so we'll even call init at the start of the game

let messages = [];

let lastKey; //Initially it's set to nothing
const keys = {
  //We create an object called keys monitoring the right and left keys, each having a property of pressed that's set to false by default
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

//The win scenario would be like reaching a particular position and so we'll maintain a variable that tracks how far we have moved from the initial position
//let keyword used for that as it'll keep changing over and over
let scrollOffset = 0;

function init() {
  //platformImage = createImage(platform);
  player = new Player();
  platforms = [
    new Platform({
      //We want our small tall platform at the farthest point; hence it should be called first in the array
      x:
        platformImage.width * 4 +
        397 +
        platformImage.width -
        platformSmallTallImage.width,
      y: 250,
      image: platformSmallTallImage,
    }),
    new Platform({ x: -1, y: 470, image: platformImage }),
    new Platform({ x: platformImage.width - 3, y: 470, image: platformImage }),
    new Platform({
      x: platformImage.width * 2 + 150,
      y: 470,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 3 + 400,
      y: 470,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 4 + 397,
      y: 470,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 5 + 840,
      y: 470,
      image: platformImage,
    }),
  ]; //Now we can add multiple platforms in this array

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background),
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills),
    }),
  ];

  messages = [
    new Message({
      x: 110,
      y: 0,
      image: win,
    }),
    new Message({
      x: 260,
      y: 40,
      image: lose,
    }),
  ];

  //The win scenario would be like reaching a particular position and so we'll maintain a variable that tracks how far we have moved from the initial position
  //let keyword used for that as it'll keep changing over and over
  scrollOffset = 0;
}

//player.update();
//player.update() must be called to make the player move actually and not draw
//Still the player just moves once and stops and doesn't move with time as we haven't added an animation loop yet

function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "white";
  //console.log("go"); We see that on running this function, the string go is being printed over and over again
  //c.clearRect(0, 0, canvas.width, canvas.height); This will completely clean off the canvas after each call and again the player is created after that, which allows the shape of the player to be maintained
  //We see that in stacked platform conditions, the player hides behind the platform and that's because we have to draw the player at the very last always; hence player.update() must be the last function called always and then thhe player will be visible in platform stacked conditions too
  c.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => {
    genericObject.draw();
  }); //The generic images must be drawn the very first as they're on the far back end

  platforms.forEach((platform) => {
    platform.draw();
  }); //Looping through the platforms array, we take each individual platform element and draw it
  //platform.draw();

  player.update();

  if (keys.right.pressed && player.position.x < 400) {
    //After 400 the background moves instead
    player.velocity.x = player.speed;
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
    if (keys.right.pressed) {
      //platform.position.x -= 5; When player moves to the right, the plaform must move to the left at the same rate to create the illusion of movement
      platforms.forEach((platform) => {
        scrollOffset += player.speed;
        platform.position.x -= player.speed; //Only when the platforms move, the scrollOffset would change
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.66; //Here parallax scroll used meaning the background objects move at a slower speed than the nearer ones as far ones move by 3 and near ones by 5
      });
    } else if (keys.left.pressed && scrollOffset > 0) {
      //platform.position.x += 5;
      platforms.forEach((platform) => {
        scrollOffset -= player.speed;
        platform.position.x += player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x += player.speed * 0.66;
      });
    }
  } //Now when we leave the A or D keys, the player stops immediately as it's written in the Animate loop

  //console.log(scrollOffset);

  platforms.forEach((platform) => {
    //For the conditionals to work just fine with the platform name, we place the entire conditional inside the arrow function
    //We will need a conditional to check if the bottom of the player is below or above the platform
    if (
      //Platform Collision Detection
      //Collision Detection code won;t work correctly after the images are imported as default width and height have been assigned to the platforms which are different from those of the image
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width //These are conditions for the player to remain on the top of the platform
    ) {
      player.velocity.y = 0;
    }
  });

  //Sprite switching
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.right
  ) {
    //When player stands after running for some distance
    player.frames = 1;
    player.currentSprite = player.sprites.run.right;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.frames = 1;
    player.currentSprite = player.sprites.run.left;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.frames = 1;
    player.currentSprite = player.sprites.stand.left;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.frames = 1;
    player.currentSprite = player.sprites.stand.right;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.stand.width;
  }

  //Win Condition
  if (scrollOffset > platformImage.width * 45 + 300) {
    console.log("You Win!!");
    messages[0].draw();
  }

  //Lose COndition; We want to restart the game once we fall into a pit and that means calling all the initialization code over again
  if (player.position.y > canvas.height) {
    console.log("You Lose!!");
    //init(); init function will reset player stats so that the game is restarted
    messages[1].draw();
  }
} //But we want an actual physics gravity here instead of just pushing our player down

init();
animate();

//We need to add Event Listeners to track the inputs given from the keyboard and then convert them to movement of the player

window.addEventListener("keydown", ({ keyCode }) => {
  //console.log("keydown"); This is just to check if our code is working fine or not
  //console.log(event); This would show in console a bunch of properties when a key is pressed, if event parameter is passed; but we need to see the keycode property that shows which key is pressed on keyboard actually
  //console.log(keyCode); This would show a number corresponding to each key called keyCode
  //Now we want upon the pressing of w, a, s or d there should be diiferent functions triggered; So, we use a Switch case here

  //Here we're determining if our sprite character is running or not, so the swap of image of character done here
  switch (keyCode) {
    case 65:
      //console.log("Left"); a key has a code of 65 and upon clicking it we test if it's being logged in console or not
      //player.velocity.x -= 1; This will make the player move to the left but even when we lift off from the key, it still continues to move
      //To do that we need to add an additional eventListener called keyup so that when we lift off from the key, the movement stops
      keys.left.pressed = true;
      // player.currentSprite = player.sprites.run.left;
      // player.currentCropWidth = player.sprites.run.cropWidth;
      // player.width = player.sprites.run.width;
      lastKey = "left";
      break;
    case 83:
      //console.log("Down");
      break;
    case 68:
      //console.log("Right");
      //player.velocity.x += 1;
      keys.right.pressed = true;
      // player.currentCropWidth = player.sprites.run.cropWidth;
      // player.currentSprite = player.sprites.run.right;
      // player.width = player.sprites.run.width;
      lastKey = "right"; //keys.pressed is not used as we may press on one key before lifting from other which may cause confusion
      break;
    case 87:
      //console.log("Up");
      player.velocity.y -= 30; //-= done as we know that - on the y axis in canvas means going up; This works as our velocity adds on to the y position of the player and once the player is in air, the gravity acts and pulls the player down ofc
      break;
    //Now we're monitoring all the key presses; To move the player around, we need to use the velocity property that moves the player
  }
  //console.log(keys.right.pressed); This is just to see that when we press the d key, the value changes to true and vice versa
}); //Again any method that comes from the window object doesn't need the mention of the word window; directly we can write addEventListener()
//Again upon keydown, i.e. pressing of any key on the keyboard, we need to call an arrow function

window.addEventListener("keyup", ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      //player.velocity.x = 0;
      keys.left.pressed = false;
      // player.currentCropWidth = player.sprites.stand.cropWidth;
      // player.currentSprite = player.sprites.stand.left;
      // player.width = player.sprites.stand.width;
      break;
    case 68:
      //player.velocity.x = 0;
      keys.right.pressed = false;
      // player.currentCropWidth = player.sprites.stand.cropWidth;
      // player.currentSprite = player.sprites.stand.right; //But initially the animation doesn't work properly as the crop width for standing and running animations are different
      // player.width = player.sprites.stand.width;
      //This won't work correctly in the unique scenario if both A and D keys are pressed, then finally the sprite won't run but just slide along when standing
      break;
  }
  //console.log(keys.right.pressed); We can use these keys properties in the animate loop to move the player to the right or left
}); //But we won't be moving our player using event listeners only because we see that upon holding the side keys for a bit too long, the player accelerates because the velocity is being continuously added to it
//To stop it accelerating, just do player.velocity.x=1 instead of +=1, etc.
//We need that when the player reaches a particular position on the screen, it stops and the background moves creating an illusion that the player is moving actually
//We'll use Parallel Scroll that ensures our background moves differently than our foreground giving a great effect
//Sprite sheets provided that have images of the character on a full cycle of movement to create a good animation effect
