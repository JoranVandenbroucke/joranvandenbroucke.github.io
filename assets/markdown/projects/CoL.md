---
title: 'Child of Lothian'
subTitle: 'A blog post about Navigation Meshes and AI navigation in games, using Geometric Algebra'
pubDate: !!str 2022-02-12
description: 'This was a group project of about 22 students, in which I was the AI programmer. In this project, we use Unreal Engine 4 C++ for the heavy lifting and blueprinting to create connections. We used Perforce and Swarm to sync our work and to make pull requests.'
image:
  url: '/assets/img/projects/CoL.jpg'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ "Col", "Child of Lothian", "Child", "Lothian", "Game" ]
carouselImages: [
  "/assets/img/projects/CoL/CoL1.jpg",
  "/assets/img/projects/CoL/CoL2.jpg",
  "/assets/img/projects/CoL/CoL3.jpg",
  "/assets/img/projects/CoL/CoL4.jpg",
  "/assets/img/projects/CoL/CoL5.jpg"
]
---

### About

Child of Lothian is a group project of about 22 students, eight artists, ten designers
and four programmers. I am the AI programmer in the group.

In Child of Lothian, you play as an Orphan who has been robbed of her childhood as her
family is put to trial during the 18th century Witch Hunt trials. The game takes place in the old town of Edinburgh.

As the AI programmer in this project, my goal was to make the NPCs good enough to make the city feel lively;
and the guards react smartly to troublemakers. I will mainly focus on underlying techniques like LODs for
AI, Tactical nodes and spacial partition mapping.

<div class="mt-5 text-center">
    <iframe src="https://store.steampowered.com/widget/1761260/" width="100%" height="190"></iframe>
</div>

### My Part

![Brain](/assets/img/projects/CoL/Brain.png)

My part in this project was the creation of general NPC behaviour. The first NPC we
created, I called Brain. Brain is the base NPC for all interactive NPCs to come and for all witch hunters to
follow. Brian was part of the first playable. He will only step aside if the player completes his quest or if
he gets distracted because the player destroyed a lamp.<br/>Right now, he has replaced bey the final
versions.

![NodeExcample](/assets/img/projects/CoL/NodeExcample.png)

To realize this, I enhanced the navmesh with a technique discussed in a GDC talk: [Spaces in the Sandbox Tactical](https://www.gdcvault.com/play/1018038/Spaces-in-the-Sandbox-Tactical)

Each node on the navmesh knows its neighbours and the nodes it's easy to get to; it also
knows which nodes are visible and how interesting a node is. The interest value tells Brain if there is
something he needs to check out.

Combining that with an EQS (environment query system), I can steer/direct Brain where I
want him to go. Our Brain has four modes the first one is "idle", the second one is "suspicious", the third
one is "confirmed", and the fourth one is "find clue".