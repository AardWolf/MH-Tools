"use strict";

/*
 * Variable Initialization
 */
var cheeseCost = 0, sampleSize = 0;

function loadCharmDropdown() {
    loadDropdown("charm", charmKeys, charmChanged, "<option>No Charm</option>");
}

window.onload = function () {
    user = CRE_USER;

    $("#instructions").click(function () {
        var instructionString = "Drag the blue 'CRE' link to your bookmarks bar if possible. If that doesn't work, try the manual steps below.\n\n";
        instructionString += "Google Chrome:\n- Bookmark a random page and name it 'CRE'";
        instructionString += "\n- Copy the bookmarklet code by right-clicking the 'CRE' link and selecting 'Copy link address...'";
        instructionString += "\n- Right click the newly created bookmark and select 'Edit...'";
        instructionString += "\n- Paste into the 'URL' field\n\n";
        instructionString += "Firefox:\n- Right click the 'CRE' link and select 'Bookmark This Link'\n\n";
        instructionString += "Internet Explorer:\n- Right click the 'CRE' link and select 'Add to favorites...'\n\n";
        instructionString += "Mobile/Other Browsers:\n- Same concept as above. Processes may vary";
        alert(instructionString);
    });

    if (creBookmarkletString !== localStorage.getItem('creBookmarklet')) {
        alert("Bookmarklet has changed! Please update accordingly.");
        localStorage.setItem('creBookmarklet', creBookmarkletString);
    }

    $("#bookmarklet").attr("href", creBookmarkletString);

    startPopulationLoad();

    loadDropdown("weapon", weaponKeys, weaponChanged, "<option></option>");
    loadDropdown("base", baseKeys, baseChanged, "<option></option>");
    loadCharmDropdown();

    gsParamCheck();

    showHideWidgets(document.getElementById("toggleCustom").checked);

    //Listening for changes in dropdowns or textboxes
    document.getElementById("toggleCustom").onchange = function () {
        var toggle = document.getElementById("toggleCustom");
        if (toggle.checked) {
            $(".input-standard").hide();
            $(".input-custom").show(500);


            $("#trapPowerType").val(trapType);
            $("#trapPowerValue").val(trapPower);
            $("#trapLuckValue").val(trapLuck);
            $("#trapAttractionValue").val(trapAtt);
            $("#trapEffect").val(trapEff);


            $("#bonusLuck").val('0');
            bonusLuck = 0;
            batteryPower = 0;
            ztAmp = 100;

            updateCustomSetup();
        }
        else {

            $(".input-custom").hide();
            $(".input-standard").show(500);

            calculateTrapSetup();
        }
        showHideWidgets(toggle.checked);
    };

    document.getElementById("trapPowerType").onchange = updateCustomSetup;
    document.getElementById("trapPowerValue").onchange = updateCustomSetup;
    document.getElementById("trapLuckValue").onchange =   updateCustomSetup;
    document.getElementById("trapAttractionValue").onchange = updateCustomSetup;
    document.getElementById("trapEffect").onchange = updateCustomSetup;

    document.getElementById("location").onchange = locationChanged;
    document.getElementById("phase").onchange = phaseChanged;
    document.getElementById("cheese").onchange = cheeseChanged;
    document.getElementById("oil").onchange = oilChanged;
    document.getElementById("toxic").onchange = toxicChanged;
    document.getElementById("battery").onchange = batteryChanged;
    document.getElementById("weapon").onchange = weaponChanged;
    document.getElementById("base").onchange = baseChanged;
    document.getElementById("charm").onchange =  charmChanged;
    document.getElementById("gs").onchange = gsChanged;
    document.getElementById("bonusLuck").onchange = bonusLuckChanged;
    document.getElementById("tourney").onchange = tourneyChanged;

    document.getElementById("ballistaLevel").onchange = genericOnChange;
    document.getElementById("canonLevel").onchange = genericOnChange;
    document.getElementById("riftstalker").onchange = genericOnChange;

    document.getElementById("cheeseCost").onchange = function () {
        cheeseCost = parseInt(document.getElementById("cheeseCost").value);
        showPop(2);
    };

    //Send to google analytics that link to setup was clicked
    document.getElementById("link").onclick = function () {
        ga('send', 'event', 'setup link', 'click');
    };
};

function updateCustomSetup() {
    var type = document.getElementById("trapPowerType").value;
    var power = document.getElementById("trapPowerValue").value;
    var luck = document.getElementById("trapLuckValue").value;
    var attraction = document.getElementById("trapAttractionValue").value;
    var effect = document.getElementById("trapEffect").value;
    if (power < 0) {
        power = 0;
        document.getElementById("trapPowerValue").value = 0;
    }
    if (luck < 0) {
        luck = 0;
        document.getElementById("trapLuckValue").value = 0;
    }
    if (attraction > 100) {
        attraction = 100;
        document.getElementById("trapAttractionValue").value = 100;
    }
    else if (attraction < 0) {
        attraction = 0;
        document.getElementById("trapAttractionValue").value = 0;
    }

    trapType = type;
    trapPower = power;
    trapLuck = luck;
    trapAtt = attraction;
    trapEff = effect;
    showPop(2);
}

function updateInputFromParameter(category, callback) {
    var parameter = getURLParameter(category);
    var input = document.getElementById(category);
    if (parameter && parameter !== NULL_URL_PARAM) {
        input.value = parameter;
        callback();
    }
}

function checkLoadState() {
    var loadPercentage = (popLoaded + baselineLoaded) / 2 * 100;
    var status = document.getElementById("status");
    status.innerHTML = "<td>Loaded " + loadPercentage + "%...</td>";

    if (loadPercentage === 100) {
        loadLocationDropdown();
        loadTourneyDropdown();

        updateInputFromParameter("oil", oilChanged);
        riftstalkerParamCheck();
        updateInputFromParameter("ballistaLevel", genericOnChange);
        updateInputFromParameter("canonLevel", genericOnChange);
        checkToxicParam();

        updateInputFromParameter("battery", batteryChanged);

        getSliderValue();
        calculateBonusLuck();

        status.innerHTML = "<td>All set!</td>";
        setTimeout(function () {
            status.innerHTML = '<td><br></td>'
        }, 3000);
    }

    function getSliderValue() {
        var amplifierParameter = parseInt(getURLParameter("amplifier"));
        if (amplifierParameter >= 0 && amplifierParameter <= 175) {
            $("#ampSlider").slider('option', 'value', amplifierParameter);
            var myColor = getColor(amplifierParameter);
            $("#ampSlider .ui-slider-range").css("background-color", myColor);
            $("#ampSlider .ui-state-default, .ui-widget-content .ui-state-default").css("background-color", myColor);
            $("#ampValue").val(amplifierParameter);
            ztAmp = amplifierParameter;
            calculateTrapSetup();
        }
    }

    function calculateBonusLuck() {
        var totalLuck = getURLParameter("totalluck");
        if (totalLuck) {
            calculateTrapSetup();
        }
        var bonusLuckParameter = parseInt(getURLParameter("bonusLuck")) || (parseInt(totalLuck) - trapLuck);
        if (bonusLuckParameter >= 0) {
            document.getElementById("bonusLuck").value = bonusLuckParameter;
            bonusLuckChanged();
        }
    }
}

/**
 * Set sample size and description of it
 */
function formatSampleSize(sampleSizeParam) {
    var str = "";
    var colored = "";
    var sizeDescriptor = "";

    sampleSizeParam = sampleSizeParam || sampleSize;
    if (sampleSizeParam) {
        if (sampleSizeParam > 27000) {
            str = "excellent";
            colored = str.fontcolor("orange");
        }
        else if (sampleSizeParam > 10000) {
            str = "good";
            colored = str.fontcolor("green");
        }
        else if (sampleSizeParam > 2400) {
            str = "average";
            colored = str.fontcolor("blue");
        }
        else if (sampleSizeParam > 500) {
            str = "poor";
            colored = str.fontcolor("red");
        }
        else {
            str = "very bad";
            colored = str.fontcolor("purple");
        }
    } else {
        sizeDescriptor = "N/A";
    }

    if (sampleSizeParam) {
        sizeDescriptor = sampleSizeParam + " (" + colored + ")";
    }

    var ss = document.getElementById("sampleSize");
    ss.innerHTML = "<strong>Sample Size:</strong> " + sizeDescriptor;
}

function checkPhase() {
    if (!phaseName) {
        phaseName = EMPTY_SELECTION;
    }
}

function showPop(type) { //type = 2 means don't reset charms

    var results = document.getElementById("results");
    var commonCheeseIndex;

    if (type !== 0 && type !== 2) {
        charmName = "No Charm";
    }

    function getHeaderRow() {
        var headerHTML = "<tr align='left'><th align='left'>Mouse</th><th data-filter='false'>Attraction<br>Rate</th><th data-filter='false'>Catch<br>Rate</th><th data-filter='false'>Catches per<br>100 hunts</th><th data-filter='false'>Gold</th><th data-filter='false'>Points</th><th data-filter='false'>Tournament<br>Points</th><th data-filter='false'>Min.<br>Luck</th>";
        if (locationName.indexOf("Seasonal Garden") >= 0) {
            headerHTML += "<th data-filter='false'>Amp %</th>";
        } else if (contains(locationName, "Iceberg") && phaseName.indexOf("Lair") < 0) {
            headerHTML += "<th data-filter='false'>Catch ft</th><th data-filter='false'>FTC ft</th>";
        } else if (locationName.indexOf("Sunken City") >= 0 && phaseName !== "Docked") {
            headerHTML += "<th data-filter='false'>Metres<br>per hunt</th>";
        } else if (locationName === "Labyrinth" && phaseName !== "Intersection") {
            headerHTML += "<th data-filter='false'>Hallway Clues</th><th data-filter='false'>Dead End Clues</th>";
        }
        headerHTML += "</tr>";
        return headerHTML;
    }

    if (!locationName || !cheeseName
        || !weaponName || !baseName || type === 0) {
        results.innerHTML = '';
    }
    else {
        checkPhase();
        var popArrayLPC = extractPopArrayLPC(locationName, phaseName, cheeseName);

        //Highlight special charms
        var specialCharmsList;
        var specialCharms = Object.keys(popArrayLPC || []);
        if (type !== 2) {
            if (specialCharms.length > 1) {
                highlightSpecialCharms(specialCharms);
            }
            /*
             * Allow pop with special charm(s) but without a "no charm" pop
             */
            else if (popArrayLPC !== null && specialCharms[0] !== EMPTY_SELECTION) {
                highlightSpecialCharms(specialCharms);
            }
            else {
                loadCharmDropdown()
            }
        }

        var popCharmName = /^(.*?)(?:\s+Charm)?$/i.exec(charmName)[1];
        if (popArrayLPC && popArrayLPC[popCharmName]) {
            var popArrayLC = popArrayLPC[popCharmName];
        }
        else {
            if (popArrayLPC) {
                popArrayLC = popArrayLPC[EMPTY_SELECTION];
            }
        }


        var deltaAmpOverall = 0;
        var deltaDepthOverall = 0, depthTest = 0;
        var diveMPH = 0;
        var avgLanternClues = 0;
        var headerHTML = getHeaderRow();

        var resultsHTML = "<thead>" + headerHTML + "</thead><tbody>";
        var overallCR = 0;
        var overallAR = getCheeseAttraction();

        var overallGold = 0;
        var overallPoints = 0;
        var overallTP = 0;
        var overallPX2 = 0;
        var percentSD = 0;
        var minLuckOverall = 0;

        if (specialCharmsList && specialCharmsList.indexOf(charmName.slice(0, -1)) >= 0) {
            sampleSize = 0;
        }

        var miceNames = Object.keys(popArrayLC || []);
        var noMice = miceNames.length;
        for (var i = 0; i < noMice; i++) {
            var mouseName = miceNames[i];

            if (mouseName !== SAMPLE_SIZE_LABEL) {
                var eff = findEff(mouseName);

                var mousePower = powersArray[mouseName][0];

                if (contains(wereMice, mouseName) && fortRox.ballistaLevel >= 1
                    || contains(cosmicCritters, mouseName) && fortRox.canonLevel >= 1) {
                    mousePower /= 2;
                }

                var catchRate = calcCR(eff, trapPower, trapLuck, mousePower);

                if (locationName === "Zugzwang's Tower") {
                    if (contains(mouseName,"Rook") && charmName === "Rook Crumble Charm") {
                        charmBonus += 300;
                        calculateTrapSetup(true); // not "cre" or else infinite loop
                        catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                        charmBonus -= 300;
                        calculateTrapSetup(true);
                    }
                    else if (mouseName === "Mystic Pawn") {
                        if (weaponName === "Mystic Pawn Pincher") {
                            weaponPower += 10920;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower -= 10920;
                            calculateTrapSetup(true);
                        }
                        else if (weaponName === "Technic Pawn Pincher") {
                            weaponPower -= 59.99;
                            weaponBonus -= 5;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower += 59.99;
                            weaponBonus += 5;
                            calculateTrapSetup(true);
                        }
                    }
                    else if (mouseName === "Technic Pawn") {
                        if (weaponName === "Mystic Pawn Pincher") {
                            weaponPower -= 59.99;
                            weaponBonus -= 5;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower += 59.99;
                            weaponBonus += 5;
                            calculateTrapSetup(true);
                        }
                        else if (weaponName === "Technic Pawn Pincher") {
                            weaponPower += 10920;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower -= 10920;
                            calculateTrapSetup(true);
                        }
                    }

                    if (contains(mouseName,"Mystic")) {
                        if (weaponName === "Obvious Ambush Trap") {
                            weaponPower -= 2400;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower += 2400;
                            calculateTrapSetup(true);
                        }
                        else if (weaponName === "Blackstone Pass Trap") {
                            weaponPower += 1800;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower -= 1800;
                            calculateTrapSetup(true);
                        }
                    }
                    else if (contains(mouseName,"Technic")) {
                        if (weaponName === "Obvious Ambush Trap") {
                            weaponPower += 1800;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower -= 1800;
                            calculateTrapSetup(true);
                        }
                        else if (weaponName === "Blackstone Pass Trap") {
                            weaponPower -= 2400;
                            calculateTrapSetup(true);
                            catchRate = calcCR(eff, trapPower, trapLuck, mousePower);
                            weaponPower += 2400;
                            calculateTrapSetup(true);
                        }
                    }
                }

                var minLuckValue = minLuck(eff, mousePower);

                /**
                 * Increase CR by 50% for ZUM in ZT/SG and Ballista/Canon 2 in FR
                 */
                if (locationName === "Zugzwang's Tower" || locationName === "Seasonal Garden") {
                    if (ztAmp > 0 && weaponName === "Zugzwang's Ultimate Move") {
                        catchRate += ((1 - catchRate) / 2);
                    }
                } else if (locationName ==="Fort Rox" ) {
                    if ((contains(wereMice, mouseName) && fortRox.ballistaLevel >= 2)
                        || (contains(cosmicCritters, mouseName) && fortRox.canonLevel >= 2)) {
                        catchRate += ((1 - catchRate) / 2);
                    }

                    if ((fortRox.canonLevel >= 3 && mouseName === "Nightfire")
                        || (fortRox.ballistaLevel >= 3 && mouseName === "Nightmancer")
                    ) {
                        catchRate = 1;
                        minLuckValue = 0;
                    }
                }

                minLuckOverall = Math.max(minLuckValue, minLuckOverall);

                //Exceptions, modifications to catch rates
                //Dragonbane Charm
                if (charmName === "Ultimate Charm") catchRate = 1;
                else if (locationName === "Sunken City" && charmName === "Ultimate Anchor Charm" && phaseName !== "Docked") catchRate = 1;
                else if (mouseName === "Dragon" && charmName === "Dragonbane Charm") catchRate *= 2;
                else if (mouseName === "Bounty Hunter" && charmName === "Sheriff's Badge Charm") catchRate = 1;
                else if (mouseName === "Zurreal the Eternal" && weaponName !== "Zurreal's Folly") catchRate = 0;

                var attractions = parseFloat(popArrayLC[mouseName]) * overallAR;

                var catches = attractions * catchRate;

                var mouseRewards = miceArray[mouseName] || [0,0];
                var mouseGold = mouseRewards[0];
                var mousePoints = mouseRewards[1];

                if (charmName === "Wealth Charm" || charmName === "Rift Wealth Charm") mouseGold += Math.ceil(Math.min(mouseGold * 0.05, 1800));
                else if (charmName === "Super Wealth Charm") mouseGold += Math.ceil(Math.min(mouseGold * 0.10, 4500));
                else if (charmName === "Extreme Wealth Charm") mouseGold += Math.ceil(Math.min(mouseGold * 0.20, 15000));

                var gold = catches * mouseGold / 100;
                var points = catches * mousePoints / 100;

                var tournamentMice = tourneysArray[tournamentName];
                if (tournamentMice) {
                    var tourneyPoints = tournamentMice[mouseName] || 0;
                } else {
                    tourneyPoints = 0;
                }
                var TP = catches * tourneyPoints / 100;
                var PX2 = TP * tourneyPoints;

                overallCR += catches;
                overallTP += TP;
                overallPX2 += PX2;
                overallGold += gold;
                overallPoints += points;

                //Formatting
                catchRate *= 100;
                catchRate = catchRate.toFixed(2);
                catches = catches.toFixed(2);

                var mouseRow = "<td align='left'>" + mouseName + "</td><td>" + attractions.toFixed(2) + "%</td><td>" + catchRate + "%</td><td>" + catches + "</td><td>" + commafy(mouseGold) + "</td><td>" + commafy(mousePoints) + "</td><td>" + tourneyPoints + "</td><td>" + minLuckValue + "</td>";

                if (locationName.indexOf("Seasonal Garden") >= 0) {
                    var dAmp = deltaAmp[mouseName];
                    if (charmName === "Amplifier Charm") dAmp *= 2;
                    mouseRow += "<td>" + dAmp + "%</td>";
                    // console.log("Amp bonus", dAmp);
                    deltaAmpOverall += catches / 100 * dAmp;
                } else if (contains(locationName,"Iceberg") && phaseName.indexOf("Lair") < 0) {
                    var deltaDepthCatch = catchDepth[mouseName];
                    var deltaDepthFTC = ftcDepth[mouseName];

                    if (charmName === "Wax Charm" && contains(berglings,mouseName)) {
                        deltaDepthCatch += 1;
                    } else if (charmName === "Sticky Charm" && contains(berglings,mouseName)) {
                        deltaDepthFTC = 0;
                    } else if (baseName === "Spiked Base" && contains(brutes,mouseName)) {
                        deltaDepthCatch = 0;
                        deltaDepthFTC = 0
                    } else if (baseName === "Remote Detonator Base" && contains(bombSquad,mouseName)) {
                        deltaDepthCatch = 20;
                    }

                    mouseRow += "<td>" + deltaDepthCatch + "</td><td>" + deltaDepthFTC + "</td>";

                    deltaDepthOverall += (catchRate / 100 * deltaDepthCatch + (100 - catchRate) / 100 * deltaDepthFTC) * attractions / 100;

                    depthTest += deltaDepthCatch * catches / 100 + deltaDepthFTC * (attractions - catches) / 100;
                } else if (locationName.indexOf("Sunken City") >= 0 && phaseName != "Docked") {
                    mouseRow += "<td></td>";
                } else if (locationName == "Labyrinth" && phaseName != "Intersection") {
                    var mouseClues = labyrinthMiceClues[mouseName];
                    if (lanternStatus == "On" && mouseClues != 0) mouseClues++;
                    if (charmName == "Lantern Oil Charm" && mouseClues != 0) mouseClues++;
                    avgLanternClues += mouseClues * catches / 100;
                    mouseRow += "<td>" + mouseClues + "</td><td></td>";
                }


                resultsHTML += "<tr align='right'>" + mouseRow + "</tr>"
            }

            formatSampleSize();
        }

        if (popArray[locationName][phaseName][commonCheeseIndex] || popArray[locationName][phaseName][cheeseName]) {
            if (charmName === "No Charm") {
                if (commonCheeseIndex) {
                    if (popArray[locationName][phaseName][commonCheeseIndex][EMPTY_SELECTION]) {
                        sampleSize = popArray[locationName][phaseName][commonCheeseIndex][EMPTY_SELECTION][SAMPLE_SIZE_LABEL];
                    }
                }
                else {
                    if (popArray[locationName][phaseName][cheeseName][EMPTY_SELECTION]) {
                        sampleSize = popArray[locationName][phaseName][cheeseName][EMPTY_SELECTION][SAMPLE_SIZE_LABEL];
                    }
                }
            }
            else {
                var slice = '';
                if (charmName.indexOf("*") >= 0) {
                    slice = charmName.slice(0, -7);
                }
                else {
                    slice = charmName.slice(0, -6);
                }
                if (commonCheeseIndex ) {
                    if (popArray[locationName][phaseName][commonCheeseIndex][slice]) {
                        sampleSize = popArray[locationName][phaseName][commonCheeseIndex][slice][SAMPLE_SIZE_LABEL];
                    }
                    else {
                        if (popArray[locationName][phaseName][commonCheeseIndex][EMPTY_SELECTION]) {
                            sampleSize = popArray[locationName][phaseName][commonCheeseIndex][EMPTY_SELECTION][SAMPLE_SIZE_LABEL];
                        }
                    }
                }
                else {
                    if (popArray[locationName][phaseName][cheeseName][slice]) {
                        sampleSize = popArray[locationName][phaseName][cheeseName][slice][SAMPLE_SIZE_LABEL];
                    }
                    else {
                        if (popArray[locationName][phaseName][cheeseName][EMPTY_SELECTION]) {
                            sampleSize = popArray[locationName][phaseName][cheeseName][EMPTY_SELECTION][SAMPLE_SIZE_LABEL];
                        }
                    }
                }
            }
        }

        //Formatting
        overallAR *= 100;
        overallPX2 -= overallTP * overallTP;
        overallPX2 = Math.sqrt(overallPX2);

        percentSD = overallPX2 / overallTP * 100;

        resultsHTML += "</tbody><tr align='right'><td align='left'><b>Overall</b></td><td>" + overallAR.toFixed(2) + "%</td><td></td><td>" + overallCR.toFixed(2) + "</td><td>" + commafy(Math.round(overallGold)) + "</td><td>" + commafy(Math.round(overallPoints)) + "</td><td>" + overallTP.toFixed(2) + "</td><td>" + minLuckOverall + "</td>";
        if (locationName.indexOf("Seasonal Garden") >= 0) {
            deltaAmpOverall += (100 - overallAR) / 100 * -3; //Accounting for FTAs (-3%)
            resultsHTML += "<td>" + deltaAmpOverall.toFixed(2) + "%</td>";
        } else if (contains(locationName,"Iceberg") && phaseName.indexOf("Lair") < 0) {
            resultsHTML += "<td colspan='2'>" + deltaDepthOverall.toFixed(2) + " ft/hunt</td>";
        } else if (locationName.indexOf("Sunken City") >= 0 && phaseName != "Docked") {
            diveMPH = 30 * overallCR / 100 + 10 * (overallAR - overallCR) / 100;
            if (charmName.indexOf("Anchor Charm") >= 0) {
                diveMPH = 10 * overallCR / 100 + 10 * (overallAR - overallCR) / 100;
            }
            else if (charmName.indexOf("Water Jet Charm") >= 0) {
                diveMPH = 500 * overallCR / 100 + 10 * (overallAR - overallCR) / 100;
            }
            resultsHTML += "<td>" + diveMPH.toFixed(2) + "</td>";
        } else if (locationName == "Labyrinth" && phaseName != "Intersection") {
            resultsHTML += "<td>" + avgLanternClues.toFixed(2) + "</td>";
            var deadEnds = (overallAR - overallCR) / 100;
            if (baseName == "Minotaur Base" || baseName == "Labyrinth Base") deadEnds /= 2; //50% negate rate
            if (charmName == "Compass Magnet Charm") deadEnds = 0;
            resultsHTML += "<td>" + deadEnds.toFixed(2) + "</td>";
        }

        var cheeseEatenPerHunt = overallAR / 100;
        var cheeseStaledPerHunt = (100 - overallAR) / 100 * freshness2stale[trapEff];
        resultsHTML += "</tr><tr align='right'><td>Profit (minus cheese cost)</td><td></td><td></td><td></td><td>" + commafy(Math.round(overallGold - cheeseCost * (cheeseEatenPerHunt + cheeseStaledPerHunt))) + "</td><td></td><td></td><td></td>";

        if (locationName.indexOf("Seasonal Garden") >= 0 || locationName.indexOf("Sunken City") >= 0 && phaseName != "Docked") {
            resultsHTML += "<td></td>";
        }
        else if (contains(locationName,"Iceberg") && phaseName.indexOf("Lair") < 0) {
            resultsHTML += "<td colspan='2'></td>";
        }
        else if (locationName == "Labyrinth" && phaseName != "Intersection") {
            resultsHTML += "<td></td><td></td>";
        }
        resultsHTML += "</tr>";
        //resultsHTML += "<tr><td><b>Overall</b></td><td>" + overallAR.toFixed(2) + "%</td><td></td><td>" + overallCR.toFixed(2) + "%</td><td>" + overallGold.toFixed(2) + "</td><td>" + overallPoints.toFixed(2) + "</td><td>" + overallTP.toFixed(2) + "+-" + overallPX2.toFixed(2) + " (" + percentSD.toFixed(2) + "%)</td></tr>";

        results.innerHTML = resultsHTML;

        var resort = true, callback = function () {
            // empty
        };
        $("#results").trigger("updateAll", [resort, callback]);
    }


    function extractPopArrayLPC(location, phase, cheese) {
        var popArrayLPC = popArray[location][phase][cheese];

        //For common cheeses e.g. gouda, brie etc.
        if (popArrayLPC === undefined && cheese !== "Cheese") {
            var popArrayL = popArray[location][phase];
            var locationKeys = Object.keys(popArrayL || []);
            var popArrayLLength = locationKeys.length;
            for (var i = 0; i < popArrayLLength; i++) {
                if (locationKeys[i].indexOf(cheese) >= 0 && locationKeys[i].indexOf("/") >= 0) {
                    commonCheeseIndex = locationKeys[i];
                    break;
                }
            }
            popArrayLPC = popArray[location][phase][commonCheeseIndex];
        }
        return popArrayLPC;
    }
}

function highlightSpecialCharms (charmList) {
    var select = document.getElementById("charm");
    var charmsDropdownHTML = '';

    var charmNames = Object.keys(charmsArray || []);
    var nCharms = charmNames.length;
    for (var c=0; c<nCharms; c++) {
        charmsDropdownHTML += "<option>"+charmNames[c]+"</option>\n";
    }
    select.innerHTML = "<option>No Charm</option>"+charmsDropdownHTML;

    for (var i=0; i<charmList.length; i++) {

        for (var j=0; j<select.children.length; j++) {
            var child = select.children[j];
            var charm = charmList[i]+" Charm";
            if (child.value === charm) {

                child.innerHTML += "*";
                child.value = charm;
                if (child.selected === true) {
                    charmName = child.value;
                    showPop(2);
                }
                select.innerHTML = select.innerHTML.slice(0,25) + "<option>"+child.innerHTML+"</option>" + select.innerHTML.slice(25);
                break;
            }
        }
    }
    selectCharm();
}

function loadCheeseDropdown(locationName, phaseName) {

    function getCheeseDropdownHTML(location, phase) {
        var cheeses = Object.keys(popArray[location][phase] || []);
        var cheeseDropdownHTML = "";
        for (var key in cheeses) {
            var option = cheeses[key];
            if (option.indexOf("/") < 0 || contains(option, "Combat")) { //Fix this master cheese thingy
                cheeseDropdownHTML += "<option>" + option + "</option>\n";
            } else {
                var optionArray = option.split("/");
                var optionArrayLength = optionArray.length;
                for (var j = 0; j < optionArrayLength; j++) {
                    cheeseDropdownHTML += "<option>" + optionArray[j] + "</option>\n";
                }
            }
        }
        return cheeseDropdownHTML;
    }

    var cheeseDropdown = document.getElementById("cheese");

    if (locationName) {
        cheeseDropdown.innerHTML = getCheeseDropdownHTML(locationName, phaseName);
    }

    var cheeseParameter = getURLParameter("cheese");
    if (cheeseParameter !== NULL_URL_PARAM && cheeseLoaded < 3) {
        var select = document.getElementById("cheese");
        select.value = cheeseParameter;
        if (select.selectedIndex !== -1) {
            cheeseLoaded++;
        }
    }
    selectCharm();
    cheeseChanged();
}

function selectCharm() {
    var charmParameter = getURLParameter("charm");
    var specialCharmParameter = charmParameter + "*";
    if (charmParameter !== NULL_URL_PARAM && charmLoaded < 5) {
        var select = document.getElementById("charm");
        //TODO: Improve
        for (var i = 0; i < select.children.length; i++) {
            var child = select.children[i];
            if (child.innerHTML === charmParameter
                || child.innerHTML === specialCharmParameter) {
                child.selected = true;
                charmChanged();
                charmLoaded++;
                break;
            }
        }
    }
}

function loadTourneyDropdown() {
    var tourneyDropdown = document.getElementById("tourney");

    var tourneyDropdownHTML = '<option></option>';

    var tourneys = Object.keys(tourneysArray || []);
    for (var key in tourneys) {
        tourneyDropdownHTML += "<option>" + tourneys[key] + "</option>\n";
    }

    tourneyDropdown.innerHTML = tourneyDropdownHTML;

    var tourneyParameter = getURLParameter("tourney");
    if (tourneyParameter !== NULL_URL_PARAM) {
        var select = document.getElementById("tourney");
        //TODO: Improve
        for (var i = 0; i < select.children.length; i++) {
            var child = select.children[i];
            if (child.innerHTML === tourneyParameter) {
                child.selected = true;
                tourneyChanged();
                break;
            }
        }
    }

}


function updateLink() {
    var urlParams = {
        "location" : locationName,
        "phase" : phaseName,
        "gs" : !gsLuck,
        "cheese" : cheeseName,
        "oil" : lanternStatus,
        "toxic" : isToxic,
        "battery" : batteryPower,
        "weapon" : weaponName,
        "base" : baseName,
        "charm" : charmName,
        "bonusLuck" : bonusLuck,
        "tourney" : tournamentName,
        "riftstalker" : riftStalkerCodex,
        "ballistaLevel" : fortRox.ballistaLevel,
        "canonLevel" : fortRox.canonLevel
    };
    var URLString = buildURL('cre.html',urlParams);
    document.getElementById("link").href = URLString;
    ga('send', 'event', 'link', 'updated', URLString);
    ga('send', 'event', 'weapon', 'selected', weaponName);
    ga('send', 'event', 'location', 'selected', locationName);
    ga('send', 'event', 'phase', 'selected', phaseName);
    ga('send', 'event', 'cheese', 'selected', cheeseName);
    ga('send', 'event', 'base', 'selected', baseName);
    ga('send', 'event', 'charm', 'selected', charmName);
    ga('send', 'event', 'tournament', 'selected', tournamentName);
}

function cheeseChanged() {
    var select = document.getElementById("cheese");
    cheeseName = select.value;
    updateLink();

    //Basic cheese costs
    var costElement = document.getElementById("cheeseCost");
    cheeseCost = standardCheeseCost[cheeseName] || 0;
    costElement.value = cheeseCost;

    //Toxic checks
    checkToxicWidget(document.getElementById("toggleCustom").checked);

    showPop();
    selectCharm();
}

function oilChanged() {
    lanternStatus = document.getElementById("oil").value;
    genericOnChange();
}

function weaponChanged() {
    var select = document.getElementById("weapon");

    updateLink();
    weaponName = select.value;
    populateWeaponData(weaponName);
    calculateTrapSetup();
}

function icebergPhase() {
    var autoPhase = "";
    if (phaseName === "Bombing Run" && baseName === "Remote Detonator Base") autoPhase = "Bombing Run (Remote Detonator)";
    else if (phaseName === "Bombing Run (Remote Detonator)" && baseName !== "Remote Detonator Base") autoPhase = "Bombing Run";

    else if (phaseName === "Treacherous Tunnels" && baseName === "Magnet Base") autoPhase = "Treacherous Tunnels (Magnet)";
    else if (phaseName === "Treacherous Tunnels (Magnet)" && baseName !== "Magnet Base") autoPhase = "Treacherous Tunnels";

    else if ((phaseName === "The Mad Depths" || phaseName === "The Mad Depths (Magnet)") && baseName === "Hearthstone Base") autoPhase = "The Mad Depths (Hearthstone)";
    else if ((phaseName === "The Mad Depths" || phaseName === "The Mad Depths (Hearthstone)") && baseName === "Magnet Base") autoPhase = "The Mad Depths (Magnet)";
    else if (phaseName === "The Mad Depths (Hearthstone)" && baseName !== "Hearthstone Base") autoPhase = "The Mad Depths";
    else if (phaseName === "The Mad Depths (Magnet)" && baseName !== "Magnet Base") autoPhase = "The Mad Depths";

    if (autoPhase !== "") {
        var phaseSelect = document.getElementById("phase");
        phaseSelect.value = autoPhase;
        phaseChanged();
    }
}

function baseChanged() {
    var baseSelet = document.getElementById("base");

    baseName = baseSelet.value;
    updateLink();
    icebergPhase();
    populateBaseData(baseName);

    //Bases with special effects when paired with particular charm
    charmChangeCommon();
    calculateTrapSetup();
}

function charmChanged() {
    var select = document.getElementById("charm");
    charmName = select.value.trim().replace(/\*$/, "");
    charmChangeCommon();
    calculateTrapSetup();
}

function tourneyChanged() {
    var select = document.getElementById("tourney");
    tournamentName = select.value;
    updateLink();
    calculateTrapSetup();
}

