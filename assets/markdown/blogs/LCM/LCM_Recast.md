---
title: 'Local Clearance Minimum in Recast'
subTitle: 'Exploring Local Clearance Minimum in Recast'
pubDate: !!str 2024-06-10
description: 'This series of blog posts is about Navmeshes. The blogs looks at how we can implement it into Recast.'
image:
  url: '/assets/img/blogs/LCM/LCM_Banner2.png'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ "LCM", "Local Clearance Minimum", "Navmesh", "Navigation Mesh", "Navmesh Generation", "Pathfinding", "Recast", "Detour", "Recast & Detour" ]
---

# Navigation Meshes
## Part 2: LCM in Recast

Welcome back!
In part 1, we explored some navmesh generators and we learned about Local Clearance Minimum (LCM).

Our previous stop introduces us to Navmesh generators and the Local Clearance Minimum (LCM).

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

1. [What is the Local Clearance Minimum?](../LCM) - A deep dive into the concept that can change the game.
2. LCM in Recast - Implementing LCMs within the Recast framework.
3. LCM: A Custom Solution from the Ground Up (Work in progress) - Building a Navmesh generator around the LCM concept.
4. Navigating Using the LCM (Work in progress) - The practical implications of pathfinding using LCMs.

### Part 2, Chapter 1: How does Recast work?

### Part 2, Chapter 2: LCM extraction methode

### Part 3, Chapter 3: Results

### Bibliography
