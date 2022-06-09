import { possibleAnswers, possibleWords} from "./words.js"

const board = document.querySelector(".board")
const messageContainer = document.getElementById("messages")
const allowed_chars = "qwertyuiopasdfghjklzxcvbnm"
const rows = 6
const columns = 5

var row_elements = []
var guesses = []
var word = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]
var current_word = ""
var finished = false
var inAnimation = false

const correctSpin = [
    {transform: "scaleY(0)", backgroundColor: "transparent", offset: 0.5},
    {backgroundColor: "var(--color-correct)", border: "none", border: "none", offset: 0.51},
    {transform: "scaleY(100%)", border: "none", backgroundColor: "var(--color-correct)", offset: 1}
]
const presentSpin = [
    {transform: "scaleY(0)", backgroundColor: "transparent", offset: 0.5},
    {backgroundColor: "var(--color-present)", border: "none", offset: 0.51},
    {transform: "scaleY(100%)", border: "none", backgroundColor: "var(--color-present)", offset: 1}
]
const absentSpin = [
    {transform: "scaleY(0)", backgroundColor: "transparent", offset: 0.5},
    {backgroundColor: "var(--color-absent)", offset: 0.51},
    {transform: "scaleY(100%)", border: "none", backgroundColor: "var(--color-absent)", offset: 1}
]

function count(string, looking_for) {
    return string.split(looking_for).length - 1 
}

for (var row = 0; row < rows; row++) {
    let row = document.createElement("div")
    row.classList.add("row")
    for (var column = 0; column < columns; column++) {
        let tile = document.createElement("div")
        tile.classList.add("tile")
        row.appendChild(tile)
    }
    row_elements.push(row)
    board.appendChild(row)
}

[...document.getElementsByClassName("key")].forEach(element => {
    element.addEventListener("click", () => {
        if (!finished && !inAnimation) {
            if (element.dataset.key == "enter") {
                submit()
            } else if (element.dataset.key == "delete") {
                deleteLetter()
            } else {
                addLetter(element.dataset.key)
            }
        }
    })
})

document.addEventListener("keydown", (event) => {
    if (!finished && !inAnimation) {
        if (allowed_chars.includes(event.key.toLowerCase())) {
            addLetter(event.key.toLowerCase())
        } else if (event.key == "Enter") {
            submit()
        } else if (event.key == "Backspace") {
            deleteLetter()
        }
    }
    if (event.key == "Delete") {
        reset()
    } else if (event.key == "ArrowUp") {
        alert(word)
    }
})

document.getElementById("reset").addEventListener("click", reset)

function addLetter(letter) {
    if (current_word.length < columns) {
        let row = row_elements[guesses.length]
        let tile = row.children[current_word.length]
        tile.classList.add("has-letter")
        tile.innerText = letter
        current_word = current_word + letter
    }
}

function deleteLetter() {
    if (current_word.length > 0) {
        let row = row_elements[guesses.length]
        let tile = row.children[current_word.length - 1]
        tile.classList.remove("has-letter")
        tile.innerText = ""
        current_word = current_word.slice(0, current_word.length - 1)
    }
}

function submit() {
    let row = row_elements[guesses.length]
    if (current_word.length < columns) {
        if (row.getAnimations().length === 0 && !current_word == "") {
            row.classList.remove("shaking")
            void row.offsetWidth
            row.classList.add("shaking")
        }
        return
    }
    if (!possibleAnswers.includes(current_word.toLowerCase())) {
        if (!possibleWords.includes(current_word.toLowerCase())) {
            row.classList.remove("shaking")
            void row.offsetWidth
            row.classList.add("shaking")
            displayMessage("Not Valid Word", 3000)
            return
        }
    }

    animateRow(row, word)

    inAnimation = true
    setTimeout(() => {
        guesses.push(current_word)
        if (word == current_word) {
            finished = true
            displayMessage("Genius")
        } else if (guesses.length == rows) {
            finished = true
            displayMessage(word.toLocaleUpperCase())
        }
        current_word = ""
        inAnimation = false
        updateKeys()
    }, 500 + columns * 200)
}

function animateRow(row, word) {
    for (var column = 0; column < columns; column++) {
        let tile = row.children[column]
        let letter = tile.innerText.toLowerCase()
        if (letter == word[column]) {
            tile.classList.add("submitted")
            tile.animate(correctSpin, {
                duration: 500,
                delay: column * 200,
                animationFillMode: "forwards"
            })
            setTimeout(() => {
                tile.classList.add("submitted-correct")
            }, 500 + column * 200 - 250)

        } else if (word.includes(letter)) {
            let before_count = count(current_word.slice(0, column), letter)
            for (var char_index = 0; char_index < columns; char_index++) {
                if (word[char_index] == letter && current_word[char_index] == letter) {
                    before_count += 1
                }
            }
            if (count(word, letter) > before_count) {
                tile.classList.add("submitted")
                tile.animate(presentSpin, {
                    duration: 500,
                    delay: column * 200,
                    animationFillMode: "forwards"
                })
                setTimeout(() => {
                    tile.classList.add("submitted-present")
                }, 500 + column * 200 - 250)
            }
        } else {
            tile.classList.add("submitted")
            tile.animate(absentSpin, {
                duration: 500,
                delay: column * 200,
                animationFillMode: "forwards"
            })
            setTimeout(() => {
                tile.classList.add("submitted-absent")
            }, 500 + column * 200 - 250)
        }
    }
}

function displayMessage(prompt, duration=0) {
    let message = document.createElement("div")
    message.classList.add("message")
    message.innerText = prompt
    messageContainer.prepend(message)

    if (duration > 1000) {
        setTimeout(() => {
            message.style.opacity = 0
        }, duration - 1000)
        setTimeout(() => {
            message.remove()
        }, duration)
    }
}

function reset() {
    word = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]
    guesses = []
    current_word = ""
    finished = false
    inAnimation = false

    row_elements.forEach((row) => {
        [...row.children].forEach((tile) => {
            tile.className = "tile"
            tile.innerText = ""
        })
    })
    messageContainer.replaceChildren([])
    updateKeys()
}

function updateKeys() {
    var correct = []
    var present = []
    var absent = []

    for (var guess = 0; guess < guesses.length; guess++) {
        for (var char_index = 0; char_index < guesses[guess].length; char_index++) {
            let char = guesses[guess][char_index]
            if (word[char_index] == char) {
                correct.push(char)
            } else if (word.includes(char)) {
                present.push(char)
            } else {
                absent.push(char)
            }
        }
    }
    [...document.getElementsByClassName("key")].forEach((key) => {
        key.className = "key"
        if (correct.includes(key.dataset.key)) {
            key.classList.add("key-correct")
        } else if (present.includes(key.dataset.key)) {
            key.classList.add("key-present")
        } else if (absent.includes(key.dataset.key)) {
            key.classList.add("key-absent")
        }
    })
}
