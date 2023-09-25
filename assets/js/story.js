// import { refreshFsLightbox } from "./fslightbox.js";

function showDetail(_commit) {
    _commit.showDetail = !_commit.showDetail;
    gitgraph.refresh();
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
    template: simpleTemplate,
});

// var onMouseOver = action('mouse over dot');

const career = gitgraph.branch("career");
career.commit({
    subject: "Init career",
});

const education = career.branch("education");
const projects = career.branch("projects");

education.commit({
    subject: "Secondary Industrial School of Electrical Engineering",
    tag: "09/1999 - 06/2003 (4 yrs)",
    body: "Electrical Engineering and Computer Science",
    detail: "spse.html",
    onMessageClick: showDetail,
});

career.merge(education, "Successfully graduated");

education.commit({
    subject: "Technical University of Kosice - MS",
    tag: "09/2003 - 05/2008 (5 yrs)",
    body: "Computer Science and Informatics",
    detail: "tuke-ing.html",
    onMessageClick: showDetail,
});

career.commit({
    subject: "Bluemont Software",
    tag: "02/2006 - 10/2006 (8 mos)",
    body: "Software Developer",
    detail: "bluemont.html",
    onMessageClick: showDetail,
});

career.commit({
    subject: "ecce",
    tag: "10/2007 - 06/2008 (8 mos)",
    body: "Software Developer",
    detail: "ecce.html",
    onMessageClick: showDetail,
});

career.merge(education, "Master's degree in Computer Science");

career.commit({
    subject: "ESET",
    tag: "09/2008 - 10/2018 (10 yrs)",
    body: "Software Developer",
    detail: "eset.html",
    onMessageClick: showDetail,
});

projects.commit({
    subject: "Building a house",
    detail: "house.html",
    onMessageClick: showDetail,
});

career.commit({
    subject: "ComAp",
    tag: "10/2018 - 10/2019 (1 yr)",
    body: "Embedded Software Developer",
    detail: "comap.html",
    onMessageClick: showDetail,
});

career.commit({
    subject: "Photoneo",
    tag: "10/2019 - 02/2022 (2 yrs 5 mos)",
    body: "Senior Software Developer",
    detail: "photoneo.html",
    onMessageClick: showDetail,
});

education.commit({
    subject: "Technical University of Kosice - PhD",
    tag: "09/2020 - 08/2023 (3 yrs)",
    body: "Electrical engineering",
    detail: "tuke-phd.html",
    onMessageClick: showDetail,
});

projects.commit({
    subject: "Fleet simulation",
    body: "ROS fleet simulation for multiple AMRs",
    detail: "fleet-sim.html",
    onMessageClick: showDetail,
});

projects.commit({
    subject: "Drone",
    body: "Indoor Mapping and Navigation with UAV",
    detail: "drone.html",
    onMessageClick: showDetail,
});

career.merge(education, "Successfully defended my dissertation thesis");

career.commit({
    subject: "Brightpick",
    tag: "02/2022 - present",
    body: "Senior Software Developer",
    detail: "brightpick.html",
    onMessageClick: showDetail,
});
