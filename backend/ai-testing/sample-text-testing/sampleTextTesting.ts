/*
    The script tests the correlation between NLI scores and readability scores and length in sample hypothesis and premise texts. 
    This is by no means a comprehensive test, but it helped to inform some of the initial hypotheses. 

    The sample texts were taken from the following Github: https://github.com/csitfun/ConTRoL-dataset 
*/

import { pipeline } from '@huggingface/transformers';
import { calculateFleschKincaid } from "../readability/flesch-kincaid";
import { analyzeWordFrequency } from "../readability/word-freq";
import * as fs from 'fs';
import * as path from 'path';

const sampleTexts = [
    {
        premise: "some time on the night of October 1st, the Copacabana Club was burnt to the ground. The police are treating the fire as suspicious. The only facts known at this stage are: The club was insured for more than its real value. The club belonged to John Hodges. Les Braithwaite was known to dislike John Hodges. Between October 1st and October 2nd, Les Braithwaite was away from home on a business trip. There were no fatalities. A plan of the club was found in Les Braithwaite's flat.",
        hypothesis: "If the insurance company pays out in full, John Hodges stands to profit from the fire.",
    },
    {
        premise: "This passage provides information on the subsidising of renewable energy and its effect on the usage of fossil fuels. The issue of subsidising sources of renewable energy came to the forefront of global politics as record emissions levels continue to be reached despite caps on carbon emissions being agreed up by several global powers. However, renewable energy sources tend more expensive than their fossil-fuel counter parts. In this way, renewable energy cannot be seen as a realistic alternative to fossil-fuel until it is at a price universally achievable. On the opposite side of the spectrum, commentators note that the average temperature is expected to rise by four degrees by the end of the decade. In order to prevent this, they suggest carbon emissions must be reduced by seventy per cent by 2050. Such commentators advocate government subsidised renewable energy forms as a way to achieve this target.",
        hypothesis: "Government subsidiary could reduce renewable energy cost",
    },
    {
        premise: "To determine whether interbreeding took place among Homo species before the populations that became modern humans left Africa, evolutionary biologists studied DNA from two African hunter-gatherer groups, the Biaka Pygmies and the San, and from a West African agricultural population, the Mandenka. Each of these groups is descended from populations thought to have remained in Africa, meaning they would have avoided the genetic bottleneck effect that usually occurs with migration. This means the groups show particularly high genetic diversity, which makes their genomes more likely to have retained evidence of ancient genetic mixing. The researchers looked at 61 non-coding DNA regions in all three groups. Because direct comparison to archaic specimens wasn't possible, the authors used computer models to simulate how infiltration from different populations might have affected patterns of variation within modern genomes. On chromosomes 4, 13 and 18 of the three African populations, the researchers found genetic regions that were more divergent on average than known modern sequences at the same locations, hinting at a different origin.",
        hypothesis: "Since the genetic diversity of the three African populations was high, while that of the indigenous population was low, researchers concluded that the three African populations had interbred.",
    },
    {
        premise: "To what extent does advertising a product at a sporting event increase sales? In light of the London Olympics, the relationship between sporting events and advertising is under greater scrutiny by British companies than ever before. Research suggests that in the year prior to the Games, twelve percent of adults talked about the Olympics on a typical day. With this in mind, it is estimated that more than one billion pounds have been invested in the Games in the form of sponsorship from companies. In return for their investment, the exposure gained by sponsors is now legally protected by statute to prevent non-official sponsors from profiting.",
        hypothesis: "As a result of the London Olympics sporting events and advertising is now protected by statute.",
    },
    {
        premise: "Todays historians aim to construct a record of human activities and to use this record to achieve a more profound understanding of humanity. This conception of their task is quite recent, dating from the development from 18th and early 19th centuries of scientific history, and cultivated largely by professional historians who adopted the assumption that the study of natural, inevitable human activity. Before the late 18th century, history was taught in virtually no schools, and it did not attempt to provide an interpretation of human life as a whole. This is more appropriately the function of religion, of philosophy, or even perhaps of poetry.",
        hypothesis: "That which constitutes the study of history has changed over time.",
    },
    {
        premise: "Today, the term surreal is used to denote a curious imaginative effect. The words provenance can be traced back to the revolutionary surrealism movement which grew out of Dadaism in the mid-1920s. Surrealism spread quite quickly across European arts and literature, particularly in France, between the two world wars. The movements founder French poet Andre Breton was influenced heavily by Freuds theories, as he reacted against reason and logic in order to free the imagination from the unconscious mind. Surrealist works, both visual and oral, juxtaposed seemingly unrelated everyday objects and placed these in dreamlike settings. Thus, the popularity of surrealist paintings, including Salvador Dalis, lies in the unconventional positioning of powerful images such as leaping tigers, melting watches and metronomes. Surrealist art is widely known today, unlike the less easily accessible works of the French surrealist writers who, ignoring the literal meanings of words, focused instead on word associations and implications. That said, the literary surrealist tradition still survives in modern-day proponents of experimental writing.",
        hypothesis: "Surrealist painting is renowned for the arbitrary portrayal of everyday objects."
    },
    {
        premise: "Traditionally medicine was the science of curing illness with treatments. For thousands of years people would have used plants and would have turned to priests for cures. In more recent times illness has been attributed less to the intervention of gods or magic and instead to natural causes. Medicine today is as much concerned with prevention as cure. Doctors use treatments of many types, including radiation and vaccination, both of which were unknown until very recent times. Other treatments have been known about and practised for centuries. Muslim doctors were skilled surgeons and treated pain with opium. When Europeans first reached the Americas they found healers who used many plants to cure illnesses. The Europeans adopted many of these treatments and some are still effective and in use today.",
        hypothesis: "Modern medicine is the science of curing illness."
    },
    {
        premise: "Traffic jams on most of the roads in the city have become a regular feature during monsoon.",
        hypothesis: "Number of vehicles coming on the roads is much more in monsoon as compared to other seasons."
    },
    {
        premise: "Traffic levels have fallen by 15% and congestion is down by a third. In August the Mayor of London announced a plan to extend the 5 charge for driving in central London during the working week westwards to Kensington and Chelsea. This was despite a consultative process in which almost 70,000 people and the vast majority of respondents said they did not want the scheme extended. However, the problem with the proposed extension is not only political. Extending the zone to a thickly populated area of London will mean that many people will qualify for the residents discount, allowing them to drive to the city without paying any extra. Extending the scheme therefore may mean that total revenues drop from the current 90 million a year.",
        hypothesis: "The extended scheme may face continued public opposition."
    },
    {
        premise: "Training Facilities The International College of Hospitality Management has more than 120 professional lecturers and international-standard, training facilities. These include three public restaurants, ten commercial training kitchens, simulated front office training facilities, four computer suites, a fully operational winery, and a food science laboratory. The Learning Resource Centre collection is extensive. The student support services provide professional counselling in the areas of health, learning support, language skills, accommodation and welfare. Childcare facilities are also available on campus. International Home The International College of Hospitality Management has students enrolled from more than 20 countries, some of whom stay on campus in International House. Built in 1999, International House is accommodation comprising villa-style units. Each student has their own bedroom, sharing en suite facilities with another student. An adjoining kitchenette and lounge area is shared by the four students in the villa. All meals are served in the College dining room which is next to the student common room. Student privacy and security are priorities. A computer outlet in each bedroom enables student to connect into the College network, providing 24 hour-a-day access. The residence is a two-minute walk to the Colleges sporting and training facilities, and is on a regular bus service to the city centre 10 km away. International House is also being used to enhance on-campus training, from Monday to Friday, Year 1 students, supervised by 2nd Years, are assigned kitchen, waiting, housekeeping and receptionist duties. Simulated check-in/check-out exercises, receptionist duties and breakfast service to a limited number of rooms are also part of the program.",
        hypothesis: "All students in the program live at International House"
    }
]

function resultToCSVRow(result : any): string {
    return [
        result.nliScore,
        result.wordCount,
        result.fleschKincaid,
        result.wordFrequency
    ].join(',');
}

function createCSVHeaders(): string {
    return 'NLI_Score,WordCount,FleschKincaid,WordFrequencyScore';
}



async function testSampleTexts() {
    const classifier = await pipeline('zero-shot-classification', 'Xenova/DeBERTa-v3-large-mnli-fever-anli-ling-wanli');
    
    const rawDataFileName = `sampleTextTest.csv`;
    const rawDataPath = path.join(__dirname, rawDataFileName);

    fs.writeFileSync(rawDataPath, createCSVHeaders() + '\n');

    for (const { premise, hypothesis } of sampleTexts) {
        const result = await classifier(premise, [hypothesis]);
        let nliScore;
        if (Array.isArray(result)) {
            nliScore = result[0]?.scores?.[0];
        } else {
            nliScore = result?.scores?.[0];
        }

        const fleschKincaid = calculateFleschKincaid(hypothesis);
        const wordFrequency = analyzeWordFrequency(hypothesis);
        const wordCount = hypothesis.split(" ").length;

        const testResult = {
            nliScore,
            fleschKincaid,
            wordFrequency,
            wordCount
        }

        fs.appendFileSync(rawDataPath, resultToCSVRow(testResult) + '\n');
    }
}

testSampleTexts();
