// import { Template } from './gitgraph.js';

// console.log(window.GitgraphJS);

function messageClick(event) {
    // Code to execute when the click event occurs
    console.log('message clicked!', event);
}

function dotClick(event) {
    // Code to execute when the click event occurs
    console.log('dot clicked!', event);
}

var myTemplateConfig = {
    colors: ["#008fb5", "#979797", "#f1c109", "#33cc33"],
    branch: {
        lineWidth: 3,
        spacingX: 30,
        labelRotation: 0
    },
    commit: {
        spacingY: 40,
        dot: {
            size: 10
        },
        message: {
            displayAuthor: false,
            displayBranch: true,
            displayHash: false,
            // font: "normal 30pt Arial"
        }
    }

};

// var myTemplate = new GitgraphJS.Template( myTemplateConfig );

var simpleTemplate = GitgraphJS.templateExtend(GitgraphJS.TemplateName.Metro, {
    colors: ["#6f43bc", "#43BC6F", "#BC6F43"],
    branch: {
        lineWidth: 4,
        spacing: 30,
    },
    commit: {
        spacing: 50,
        dot: {
            size: 10,
        },
        message: {
            displayHash: false,
            displayAuthor: false,
        },
    },
    // tag: {
    //     pointerWidth: 10,
    // },
});

// Get the graph container HTML element.
const graphContainer = document.getElementById("graph-container");
const gitgraph = GitgraphJS.createGitgraph(graphContainer, {
    template: "metro", // or blackarrow
    orientation: "vertical",
    elementId: 'graph',
    mode: "extended", // or compact if you don't want the messages
    template: simpleTemplate
});

// var onMouseOver = action('mouse over dot');

const career = gitgraph.branch("career");
career.commit({
    subject: "Init career",
    //   date: new Date("2023-06-01"),
    //   body: 'This is to explain the rationale behind this commit.',
    //   onMouseOver: onMouseOver
});

const education = career.branch("education");
const projects = career.branch("projects");

education.commit({
    subject: "Secondary Industrial School of Electrical Engineering",
    tag: "09/1999 - 06/2003 (4 yrs)",
    body: "Emulator 8051, ",
});

career.merge(education, "Successfully graduated");

education.commit({
    subject: "Technical University of Kosice",
    tag: "09/2003 - 05/2008 (5 yrs)",
    body: "Computer science, openGL",
});

career.commit({
    subject: "BLUEMONT SOFTWARE",
    tag: "02/2006 - 10/2006 (8 mos)",
    body: "Software Developer"
});

career.commit({
    subject: "ecce",
    tag: "10/2007 - 06/2008 (8 mos)",
    body: "Software Developer",
});

career.merge(education, "Master's degree in Computer Science");

career.commit({
    subject: "ESET",
    tag: "09/2008 - 10/2018 (10 yrs)",
    body: "Software Developer",
});

projects.commit({
    subject: "Building a house",
    // body: "Indoor drone navigation",
});

career.commit({
    subject: "ComAp",
    tag: "10/2018 - 10/2019 (1 yr)",
    body: "Embedded Software Developer",
});

career.commit({
    subject: "Photoneo",
    tag: "10/2019 - 02/2022 (2 yrs 5 mos)",
    body: "Senior Software Developer",
});

education.commit({
    subject: "Technical University of Kosice - PhD",
    tag: "09/2020 - 08/2023 (3 yrs)",
    body: "Autonomous drone",
});

projects.commit({
    subject: "Fleet simulation",
    body: "ROS fleet simulation for AMRs",
});

projects.commit({
    subject: "Drone",
    body: "Indoor drone navigation",
    onClick: dotClick,
});

career.commit({
    subject: "Brightpick",
    tag: "02/2022 - present",
    // body: "Senior Software Developer",

    // body: "",
    onMessageClick: messageClick,
});

// career.merge(education, "Successfully defended my dissertation thesis");
