---
title: 'Software Rasterizer'
subTitle: 'Software Rasterizer'
pubDate: !!str 2022-02-12
description: 'In this solo project for school, I made a software rasterizer using Visual Studio, C++17, SDL2, and SDL2-Image.'
image:
  url: '/assets/img/projects/SoftRasterizer.bmp'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: ["Soft", "software", "rasterizer", "rasterization", "cpp", "c++", "SDL"]
carouselImages: [
  "/assets/img/projects/Software%20Rasterizer/1_BackbufferRender.bmp",
  "/assets/img/projects/Software%20Rasterizer/2_BackbufferRender.bmp",
  "/assets/img/projects/Software%20Rasterizer/3_BackbufferRender.bmp",
  "/assets/img/projects/Software%20Rasterizer/4_BackbufferRender.gif",
]
---
## About

The software rasterizer is a 2nd-year Game Developer assignment where each student makes their rasterizer using Visual Studio, C++, SDL2, SDL2_image and Perforce. The assignment stated that we should be able to render the vehicle (3rd image) using a specular workflow, a diffuse map, a specular map, a glossy map and a normal map.

I added an extra model

## Rasterization

My rasterization technique was inspired by how I implemented my ray-triangle intersection in the Software Ray Tracer

```cpp
void Rasterize( V2F v0, V2F v1, V2F v2, bool showDepth, const Texture* pDiffuse, const Texture* pNormal, const Texture* pSpecular, const Texture* pGloss )const
{
if( !CullingAndToRasterSpace( v0, v1, v2, m_Width, m_Height ) )
return;

    float BA[6];
    float CB[6];
    float AC[6];

    //convert transformed vertices into plucker coordinates
    PointsToPlucker( v1.position.xyz, v0.position.xyz, BA );
    PointsToPlucker( v2.position.xyz, v1.position.xyz, CB );
    PointsToPlucker( v0.position.xyz, v2.position.xyz, AC );

    //calculate outer X and Y positions
    int minX = (int) std::floor( std::max( std::min( std::min( v0.position.x, v1.position.x ), v2.position.x ), 0.f ) );
    int maxX = (int) std::ceil( std::min( std::max( std::max( v0.position.x, v1.position.x ), v2.position.x ), float( m_Width - 1 ) ) ) + 1;
    int minY = (int) std::floor( std::max( std::min( std::min( v0.position.y, v1.position.y ), v2.position.y ), 0.f ) );
    int maxY = (int) std::ceil( std::min( std::max( std::max( v0.position.y, v1.position.y ), v2.position.y ), float( m_Height - 1 ) ) ) + 1;

    for( int y = minY; y < maxY; ++y )
    {
        for( int x = minX; x < maxX; ++x )
        {
            float2 point{ float( x ), float( y ) };
            float viewPoint[6];
            RayToPlucker( point, { 0.f, 0.f, -1.f }, viewPoint );
            
            //look where the current pixel is compared to the triangle, the outomst is also our barycentric coordinates
            float w0 = Side( viewPoint, CB );
            float w1 = Side( viewPoint, AC );
            float w2 = Side( viewPoint, BA );

            if( w0 >= 0 && w1 >= 0 && w2 >= 0 )
            {
                // normalizing the barycentric coordinates
                float totalW = w0 + w1 + w2;
                w0 /= totalW;
                w1 /= totalW;
                w2 /= totalW;
                
                //depth test
                const float interpolatedZ = 1.f / ( w0 / v0.position.z + w1 / v1.position.z + w2 / v2.position.z );
                if( interpolatedZ > 1 || interpolatedZ > m_pDeptheBuffer[y * m_Width + x] || interpolatedZ < 0 )
                    continue;
                
                const float interpolatedW = 1.f / ( w0 / v0.position.w + w1 / v1.position.w + w2 / v2.position.w );
                
                //propper interpolation using barycentric coordinates
                V2F i{};
                i.position = ( v0.position * w0 / v0.position.w + v1.position * w1 / v1.position.w + v2.position * w2 / v2.position.w ) * interpolatedW;
                i.worldPosition = ( v0.worldPosition * w0 / v0.position.w + v1.worldPosition * w1 / v1.position.w + v2.worldPosition * w2 / v2.position.w ) * interpolatedW;
                i.normal = ( v0.normal * w0 / v0.position.w + v1.normal * w1 / v1.position.w + v2.normal * w2 / v2.position.w ) * interpolatedW;
                i.tangent = ( v0.tangent * w0 / v0.position.w + v1.tangent * w1 / v1.position.w + v2.tangent * w2 / v2.position.w ) * interpolatedW;
                i.color = ( v0.color * w0 / v0.position.w + v1.color * w1 / v1.position.w + v2.color * w2 / v2.position.w ) * interpolatedW;
                i.uv = ( v0.uv * w0 / v0.position.w + v1.uv * w1 / v1.position.w + v2.uv * w2 / v2.position.w ) * interpolatedW;
                
                Normalize( i.normal );
                Normalize( i.tangent );
                
                m_pBackBuffer[y * m_Width + x] = PixelShading( i, pDiffuse, pNormal, pSpecular, pGloss );
                m_pDeptheBuffer[y * m_Width + x] = interpolatedZ;
            }
        }
    }
}
```