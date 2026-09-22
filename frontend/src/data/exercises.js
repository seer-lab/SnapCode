export const exercises = [
    { id: 0, title: 'Lesson 1. Hello World', description: "Print \"Hello, World!\" using a h1 tag.", expectedOutput:"<html><h1>Hello World</h1></html>",status: 'Enhanced' },
    { id: 1, title: '2. Eye Chart', description: "Make the following eye chart using h1 to h6 tags progressively", expectedOutput:"<html><body><h1>E</h1><h2>F P</h2><h3>T O Z</h3><h4>L P E D</h4><h5>P E C F O</h5><h6>E D F C Z P </h6></body></html>", status: 'Completed' },
    { id: 2, title: 'Head and Body', description: "Make an HTML page with both the head and body tag. This exercise will be marked based on the correct use of the tags.", expectedOutput:"<html><head></head><body>This page has both head and body tags.</body></html>", status: 'InProgress' },
    { id: 3, title: 'Paragraph Tag', description: "Make the following page with a heading of Introduction and then introduce yourself using a paragraph tag", expectedOutput:"<html><body><h1>Introduction</h1><p>Hi, my name is Gauri and I am 12 years old. I love cooking and listening to music. My favourite subject is english!</p></body></html>", status: 'NotStarted' },
    { id: 4, title: 'Text Formatting*', description: "Make the following page with a bolded text, red h2 text and a paragraph tag.", expectedOutput:"<html><head><h2>Trying Incline CSS</h2></head><body><p>A new background and font color with inline CSS</p></body></html>", status: 'NotStarted' },
    { id: 5, title: 'Quotes', description: "Make the following page with a quote and blockquote.", expectedOutput:"<html><body><q>This a text inside quotes.</q><blockquote>This is text inside blockquote.</blockquote></body></html>", status: 'NotStarted' },
    { id: 6, title: 'Personal Website', description: "Make a page describing your interests. Make sure you use atleast two different heading tags, two paragraph tags, quotes and text formatting (bold and italics).", expectedOutput:"<html><body><h1>About me</h1><h3>Introduction</h3><p>My name is <b>Priya</b> and I am 14 years old. I live in Delhi.<h3>My Likes and Dislikes</h3><h4>Likes</h4><p>I like reading comic books and watching movies.</p><h4>My Dislikes</h2><p><italics>I don't like cats and the colour green.</italics></p><h4>My Favourite Quote</h4><q>The word IMPOSSIBLE says I'm Possible</q></body></html>", status: 'NotStarted' },
    { id: 7, title: 'Font-Family', description: "Make a page about your daily routine and using the list of fonts change the fonts of both title and paragraph.", expectedOutput:"", status: 'NotStarted' },
    { id: 8, title: 'Font-Size', description: "Make a page about your daily routine and using the list of fonts change the fonts of both title and paragraph.", expectedOutput:"", status: 'NotStarted' },
    { 
      id: 9, title: 'Daily Routine', 
      description: "Make a page with a heading and paragraph tags. Use inline CSS to change their font-family, font-size, and text alignment.", 
      expectedOutput:"<html><body><h1 style=\"font-family: Arial, sans-serif; font-size: 28px; text-align: center;\">My Daily Routine</h1><p style=\"font-family: 'Courier New', monospace; font-size: 16px; text-align: justify;\">This is a styled paragraph with custom font family, size, and text alignment using inline CSS.</p><ol><li>Wash my face.</li></ol></body></html>", 
      status: 'NotStarted' 
    },
    { 
      id: 10, title: 'Milestone Project', 
      description: "Create an HTML page with head and body tags. Include a title tag in the head, a heading with your name, and a paragraph describing yourself.", 
      expectedOutput:"<html><head><title>About Me</title></head><body><h1 style=\"background-color: pink;\">Japnit</h1><b >About me:</b><p style=\"background-color: pink;\">Hello. I am Japnit. I am the founder of the Go Girl Organisation. My goal for this organisation is to inspire girls to discover and pursue programming through our fun and friendly workshops in Python, HTML, and CSS.</p></body></html>", 
      status: 'NotStarted' 
    },
    {
      id: 11,
      title: 'Practice with Bold',
      description: "Make the provided motivational sentence bold using the <b> tag inside the body.",
      expectedOutput: "<html><head><title>Practice with Bold</title></head><body><b>Coding can be frustrating at times, but if I keep asking for help and surround myself with other programmers, it will be easier and a lot more fun!! I got this</b></body></html>",
      status: 'NotStarted'
    },
    {
      id: 12,
      title: 'Practice with Italics',
      description: "Italicize the provided quote using the <i> tag inside the body.",
      expectedOutput: "<html><head><title>Practice with Italics</title></head><body><i>There's never been a drug approved for aging for any species, dog or human. My core goal in life is to get the first drug approved.\"</i></body></html>",
      status: 'NotStarted'
    },
    { 
      id: 13, title: 'Milestone Project pt.2', 
      description: "Continue your personal website by editing your paragraphs about yourself by italicizing and bolding whatever you want.", 
      expectedOutput:"<html><head><title>About Me</title></head><body><h1 style=\"background-color: pink;\">Japnit</h1><b >About me:</b><p style=\"background-color: pink;\">Hello. I am Japnit. I am the founder of the <b>Go Girl Organisation</b>. My goal for this organisation is to inspire girls to discover and pursue programming through our fun and friendly workshops in Python, HTML, and CSS.</p></body></html>", 
      status: 'NotStarted' 
    },
    { 
      id: 14, title: 'Tags & Blockquote',
      description: "Display a short quote using the <q> tag and a longer quote using the <blockquote> tag inside the body.",
      expectedOutput: "<html><head><title>replit</title></head><body><p>Here are my favorite quotes</p><q>Progress over prefection</q><blockquote>If we leave something unchecked for a long time sooner or later it will burst and there will be a downpour</blockquote></body></html>",
      status: 'NotStarted'
    },
    { 
      id: 15, title: 'Milestone Project (tags & blockquotes)',
      description: "Continue your personal website by adding your favorite movie quote.", 
      expectedOutput:"<html><head><title>About Me</title></head><body><h1 style=\"background-color: pink;\">Japnit</h1><b >About me:</b><p style=\"background-color: pink;\">Hello. I am Japnit. I am the founder of the <b>Go Girl Organisation</b>. My goal for this organisation is to inspire girls to discover and pursue programming through our fun and friendly workshops in Python, HTML, and CSS.</p></body></html>", 
      status: 'NotStarted' 
    },
    { 
      id: 16, title: 'Milestone Project (comments)',
      description: "Continue your personal website by adding your favorite movie quote.", 
      expectedOutput:"<html><head><title>About Me</title></head><body><h1 style=\"background-color: pink;\">Japnit</h1><b >About me:</b><p style=\"background-color: pink;\">Hello. I am Japnit. I am the founder of the <b>Go Girl Organisation</b>. My goal for this organisation is to inspire girls to discover and pursue programming through our fun and friendly workshops in Python, HTML, and CSS.</p></body></html>", 
      status: 'NotStarted' 
    },
    {
      id: 17,
      title: 'Adding Images',
      description: "Display an image using the <img> tag with a valid src attribute and alt text.",
      expectedOutput: "<html><head><title>Practice with Images</title></head><body><h1>My Favorite Animal</h1><img src=\"https://breedingbusiness.com/wp-content/uploads/2021/07/cutest-small-white-dog-breeds.jpg\" alt=\"Placeholder Image\" /></body></html>",
      status: 'NotStarted'
    },
    {
      id: 18,
      title: 'Embedding Videos with Iframe',
      description: "Embed a video inside the body tag using the <iframe> element with width, height, and src attributes.",
      expectedOutput: "<html><body><iframe width=\"550\" height=\"340\" src=\"https://www.youtube.com/embed/W1S9AbHpWFY\"></iframe></body></html>",
      status: 'NotStarted'
    },
    { 
      id: 19, title: 'Milestone Project (Add multimedia)',
      description: "Continue your personal website by adding your favorite place, food and actor. ", 
      expectedOutput: "<html><head><title>About Me</title></head><body><h1 style=\"background-color: pink;\">Japnit</h1><b>About me:</b><p style=\"background-color: pink;\">Hello. I am Japnit. I am the founder of the <b>Go Girl Organisation</b>. My goal for this organisation is to inspire girls to discover and pursue programming through our fun and friendly workshops in Python, HTML, and CSS.</p><h2>My Favorite Place</h2><img src=\"https://images.unsplash.com/photo-1502602898657-3e91760cbb34\" alt=\"Paris\" width=\"300\" /><h2>My Favorite Food</h2><img src=\"https://images.unsplash.com/photo-1513104890138-7c749659a591\" alt=\"Pizza\" width=\"300\" /><h2>My Favorite Actor</h2><img src=\"https://www.nme.com/wp-content/uploads/2024/04/Tom-Holland-Romeo-Juliet.jpg\" alt=\"Actor\" width=\"300\"/></body></html>",
      status: 'NotStarted' 
    },
    {
      id: 20,
      title: 'News Website Project',
      description: "Create a news website with a main title (h1) and 4 articles. Each article must include an image (img), a headline (h2), and a short description (p).",
      expectedOutput: "<html><head><title>Global News</title></head><body><h1>Daily World News</h1><h2>Tech Breakthroughs in 2026</h2><img src=\"https://images.unsplash.com/photo-1518770660439-4636190af475\" alt=\"Tech News\" width=\"300\" /><p>New advancements in artificial intelligence are reshaping how students learn programming around the globe.</p><h2>Global Climate Summit</h2><img src=\"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05\" alt=\"Nature\" width=\"300\" /><p>World leaders gather to discuss sustainable energy solutions and ocean conservation efforts.</p><h2>Space Exploration Milestone</h2><img src=\"https://images.unsplash.com/photo-1451187580459-43490279c0fa\" alt=\"Space\" width=\"300\" /><p>Astronomers discover new details about distant exoplanets using next-generation space telescopes.</p><h2>Local Community Art Festival</h2><img src=\"https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b\" alt=\"Art Festival\" width=\"300\" /><p>Artists from around the city bring streets to life with murals, music, and interactive exhibits.</p></body></html>",
      status: 'NotStarted'
    }
  ];
