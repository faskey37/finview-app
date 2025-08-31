
"use client"

import * as React from "react"
import { useNews } from "@/hooks/use-news"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

export default function NewsPage() {
  const { articles, loading, error } = useNews()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial News</h1>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : error ? (
         <Card className="col-span-full">
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p>Could not load news. Please check if the NEWS_API_KEY is configured correctly.</p></CardContent>
        </Card>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{article.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <div className="text-xs text-muted-foreground">
                    <p>{article.source.name}</p>
                    <p>{format(new Date(article.publishedAt), "PPP")}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardHeader><CardTitle>No News Available</CardTitle></CardHeader>
            <CardContent><p>Could not retrieve any news articles at this time.</p></CardContent>
        </Card>
      )}
    </div>
  )
}
