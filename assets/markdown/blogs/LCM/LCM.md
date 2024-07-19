---
title: 'What is the Local Clearance Minimum (LCM)?'
subTitle: 'A deep dive into the concept that can change the game.'
pubDate: !!str 2024-06-10
description: 'This blog explains a new consept (local clearance minimum) for navigation meshes. When applied properly, this can reduce the amount of needed Navmeshes and increase NPC design possibilities.'
image:
  url: '/assets/img/blogs/LCM/LCM_Banner.png'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ 'Local Clearance Minimum', 'LCM', 'Navmesh', 'Recast', 'Game Development', 'Pathfinding' ]
---

# Navigation Meshes

## Part 1: What is the Local Clearance Minimum

Welcome to the world of Navigation Meshes, or Navmeshes for short.
Get ready for an exciting journey!
In this series, we are not just scratching the surface; we are exploring every nook and cranny of this fascinating
topic, and we invite you to join us in this exploration.

Our first stop introduces us to Navmeshes and the Local Clearance Minimum (LCM), which reshapes our thinking about
virtual spaces and their characters.
As we venture forward, Part 2 looks at Recast and its role in the Navmesh generation process.
We'll explore how to add LCMs into the pipeline using Recast, a popular open-source library that has also been adopted
in Unreal Engine.
We will run tests and analyse the results.
The statistics will show the strengths and weaknesses of the new algorithm.
Our exploration does not end there.

The narrative continues in Part 3, where we create a Navmesh generation method from scratch.
The new generator uses the medial axis to detect LCMs.
The medial axis is a mathematical concept representing a shape's skeleton.
In the context of Navmesh generation, it's used to identify the tightest spots in the environment where LCMs are needed.
This approach can be a modern, reliable, fast alternative for frameworks like Recast.

Our journey culminates in Navigation City.
In Part 4, we will use the generated LCMs to do pathfinding.
This will be different from standard methods as we will have to take LCMs into account.

### Navigating the Blogs

Here is what you can expect in each Part:

1. What is the Local Clearance Minimum (LCM)? - A deep dive into the concept that can change the game.
2. [LCM in Recast](../LCM_Recast) - Implementing LCMs within the Recast framework.
3. LCM: A Custom Solution from the Ground Up (Work in progress) - Building a Navmesh generator around the LCM concept.
4. Navigating Using the LCM (Work in progress) - The practical implications of pathfinding using LCMs.

### Part 1, Chapter 1: Decoding the Navmesh

Imagine you are a character in a game.
You look around and see a world filled with possibilities and obstacles.
How do you know where to step?
Enter the Navmesh, the unsung hero guiding your every move.
It's the floor plan of walkable spaces, ensuring you never bump into a wall or phase through it.

In the early days, Snook penned down one of the pioneering definitions of a Navmesh.
He defined a Navmesh as coarse geometry covering the open, walkable surface area [\[6\]](#6).
But back then, creating a Navmesh was more art than science, there was no magic button to bring it to life.
A Navmesh exists out of a set of regions and a connection graph.
Together, they are the cell-and-portal graph that guides characters through the virtual world.

### Part 1, Chapter 2: The Craft of Navmesh Creation

Navmesh Generators can figure out the environment and sketch a floorplan of your world.
Let me introduce you to some of them.

Rabin, in a chapter of "AI Game Programming Wisdom", introduced a method to conjure up a Navmesh from thin
air [\[5\]](#5).
His method, documented within its pages, uses the Hertel Mehlhorn triangulation algorithm [\[5\]](#5).
Yet, this approach needed to optimise the number of convex regions.
This prompted Rabin to append more steps to polish the outcome.

Then there's Kallmann with the Dynamic and Robust Local Clearance Triangulation (LCT) [\[2\]](#2).
This work was based on Fully Dynamic Constrained Delaunay Triangulations (CDT) by Kallmann et al.
By combining CDT with the concept of clearance, the minimum edge-to-edge distance, Kallmann made LCT fully dynamic and
adaptable to real-time changes.

![A tale of two scenes: The classic Romeo and Juliet (Left) and their LCT rendition (Right)](/assets/img/blogs/LCM/LCM_exactMethods.png)

<sub id='F1'>Figure 1: Romeo and Juliet (Left), Romeo and Juliet according to LCT (Right)</sub>

While these "exact" methods were accurate, they struggled with overlapping geometries.
If your geometry has overlapping parts, you must feed the generator layer per layer.
That's where 'voxel' methods come in.
They treat the scene as a 3D pixel puzzle, simplifying the complex without skipping a beat.
Voxel methods are algorithms that break down the environment into small, uniform 'voxels' or 3D pixels.
These can then be used to create a simplified representation of the environment for the Navmesh generation.

Recast [\[7\]](#7), an open-source voxel method, has even made a cameo in Unreal Engine.
It is based on the Volumetric cell-and-portal generation crafted by Haumont et al. [\[1\]](#1).
It starts by voxelizing the scene and removing the voxel if it is not walkable.
Recast creates a distance map with all the walkable cells using a watershed algorithm to assign region IDs later.
Those IDs are then traced and transformed into a navigable mesh.

And let's not forget NEOGEN, the creation of Oliva and Pelechano [\[4\]](#4).
NEOGEN's goal?
To craft a Navmesh with the fewest convex regions possible.
A GPU-powered wizard separates layers in the scene, sketches a 2D floor plan, and performs a convex decomposition to
link them all together.

### Part 1, Chapter 3: The Role of Local Clearance Minimum in the World of Navmeshes

Now that we've journeyed through the labyrinth of Navmesh generators, it's time to tackle a pressing issue.
Picture this: a bustling virtual city with agents of all shapes and sizes, each with their own paths to tread.
The challenge arises when these agents differ in size.
Typically, we'd shrink the walkable terrain by the agent's radius before crafting a Navmesh, ensuring our digital
citizens don't awkwardly clip through walls, see [Figure 2](#F2).

![A room with a navmesh (left) and agent placed at the edge of the Navmesh to show how wall clipping gets avoided (right)](/assets/img/blogs/LCM/LCM_Offset.png)

<sub id='F2'>Figure 2: This figure shows how the offset helps navigate and avoids wall clipping.</sub>

But what happens when we have diverse characters, each with unique dimensions?

We're tasked with creating many Navmeshes, one for each agent size.
This isn't just a headache for developers, it's a memory hog, especially in big, lively, open-world games.

Introducing the hero of our story: the Local Clearance Minimum (LCM).
The LCM is a point or sequence of points on the medial axis where the distance to obstacles is the smallest locally.
Imagine the LCM as a city planner for our virtual world.
It identifies the tightest spots in the environment, the doorways and hallways, where space is minimal.
By drawing lines on these LCMs, we define our region borders, transforming a complex web of individual paths into a
unified Navmesh.

This approach means that we verify if an agent can squeeze through each LCM during pathfinding.
While we remove the offsets for each agent in the Navmesh, we need to reintroduce them during navigation while we smooth
the paths and add a touch of realism.

But where do we find these LCMs?
They can be easily found in the environment's medial axis when the medial axis value is locally smallest.
[Figure 3](#F3) shows we can approximate the medial axis with a distance map.

![The medial axis and distance map of the same environment]( /assets/img/blogs/LCM/LCM_medialDistance.png)

<sub id='F3'>Figure 3: The medial axis (left) and distance map (right) of the same environment</sub>

The LCM is a saddle point or a saddle segment on a distance map.
A saddle point is like the centre point on a pringles: the lowest point in one direction and the highest in another.
So, a saddle segment is a series of such points, forming a path of saddle points.

![Navigating the saddle points](/assets/img/blogs/LCM/LCM_SaddlePointSegment.png)

<sub id='F4'>Figure 4: A saddle graph with saddle point as centre point (left), distance map representation of saddle graph (
centre), distance map of a saddle segment (right)</sub>

To harness the power of LCMs, we calculate the medial axis and traverse it until we hit a saddle point or segment.
At these critical junctures, we connect the dots, literally, linking boundary points to form our region's borders.
It's a discovery process, tracing the skeletal framework of our virtual world.

In our next instalment ([LCM in Recast](../LCM_Recast)), where we'll explore a method of generating a Navmesh using LCMs.
We'll dive into Recast [1], a renowned open-source library Navmesh generation.

### Bibliography

<p id='1'>[1] D. Haumont, O. Debeir, and F. Sillion. 2003. Volumetric cell-and-portal generation. Computer Graphics Forum 22, 3 (2003), 303-312. [https://doi.org/10.1111/1467-8659.00677](https://doi.org/10.1111/1467-8659.00677)</p>
<p id='2'>[2] M. Kallmann. 2010. Dynamic and robust Local Clearance Triangulations. ACM Transactions on Graphics (TOG) 29, 4 (2010), 1-10. [https://doi.org/10.1145/1778765.1778768](https://doi.org/10.1145/1778765.1778768)</p>
<p id='3'>[3] J. O'Rourke. 1998. Computational geometry in C. Cambridge University Press.</p>
<p id='4'>[4] P. Oliva and N. Pelechano. 2013. NEOGEN: Near optimal generator of navigation meshes for 3D multi-layered environments. Computers & Graphics 37, 5 (2013), 403-412. [https://doi.org/10.1016/j.cag.2013.04.006](https://doi.org/10.1016/j.cag.2013.04.006)</p>
<p id='5'>[5] S. Rabin. 2002. AI Game Programming Wisdom. Charles River Media (2002), 171-185.</p>
<p id='6'>[6] G. Snook. 2000. Simplified 3D movement and pathfinding using navigation meshes. Game Programming Gems 1 (2000), 288-304.</p>
<p id='7'>[7] 2023. Recast & Detour. Retrieved March 6, 2023 from https://github.com/recastnavigation/recastnavigation</p>
