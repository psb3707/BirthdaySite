"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, ArrowRight, Camera } from "lucide-react"

export default function LetterPage() {
  const [currentPage, setCurrentPage] = useState(0)

  const letterPages = [
    {
      title: "사랑하는 채원이에게",
      content: `사랑하는 채원아 생일 정말 축하해! 이렇게 채원이한테 편지 쓰는 것도 진짜 오랜만이네ㅎㅎ 시간이 어느새 흘러서 채원이의 2번째 생일을 이렇게 축하해 줄 수 있어서 너무 기뻐! 
       채원이의 23번째 생일을 맞이해서 이렇게 색다른 선물을 준비해봤는데 어때? 마음에 들려나…? ㅎㅎ 그동안 우리 추억을 모아놓은 사진첩을 만들어봤어! 
       사실 조금 허접하긴 해서 모든 사진이 모여있진 않지만 그래도 나와 채원이의 기억에 가장 선명하게 남아있는 사진들 위주로 골라봤어!  이렇게 모아놓고 보니까 그동안 채원이와 함께 보낸 시간들이 너무 예뻐서 나도 엄청 뿌듯하더라고😊 `,
    },
    {
      title: "",
      content: `사실 채원이가 교환학생 갔다가 돌아왔을 때만 해도 다시 이렇게 떨어지게 될 줄은 몰랐는데 새삼 놀랍더라.. 그렇게 그리워 하다보니 시간이 벌써 이렇게 빨리 갔네ㅋㅋ
       그 시간동안 우리 같이 힘들어했지만 특히, 채원이가 브라질에서 겪은 여러가지 일들 때문에 마음 쓰이고, 아파할 때마다 곁에 있던 나도 너무 안타깝고 직접 옆에서 보듬어 주지 못한게 미안하더라구.. 
       그랬지만 어느새 잘 이겨내고 회사도 멋있게 다니는 모습을 보면서 채원이가 너무나 대견하고 어른스러워 보였어! 채원이는 항상 눈물이 난다고 하지만 늘 슬픔 뒤에는 꿋꿋히 문제를 스스로 해결하려는 자기의 모습이 있었기에 분명 잘 이겨낼 수 있었을거야!
        그런 모습을 보면서 나도 채원이를 본받아야 겠다 라는 생각이 들더라구..  동시에 채원이한테 한번 더 반했던 것 같아!😍`,
    },
    {
      title: "",
      content: `만난 시간이 오래될수록 상대에게 익숙해지고 뜨거움도 덜 해진다는데 우린 시간이 지날 수록 점점 더 보고 싶어지는 것 같네ㅎㅎ 특히, 요즘에 채원이랑 통화할 때면 난 거의 버릇처럼 “보고싶어..” 라고 말하는 것 같아 
      채원이가 가면 갈수록 더 예뻐보이고 나한테 말해주는 것도 더 사랑스럽게 느껴져! “자기랑 같이 살고싶다” “결혼하고 싶다” 라는 말이 빈말이 아니라 정말 채원이와 같이 나와 마음이 잘 맞고 날 아껴주는 사람과 함께 살면서 일상을 함께한다면 다른 누구보다 행복할 자신이 있어!
       동시에 내가 채원이에게 어울리는 사람이 되고 싶기에 더욱 현재에 충실한 삶을 살게 되구ㅎㅎ
       채원이의 생일이 더 먼저긴 하지만 우리가 만난지도 어느새 500일이 되었네 정말 우리 오래만났당!ㅎㅎ 이 긴 시간동안 날 선택해서 나와 함께 가장 아름다운 한때를 보내줘서 너무 고마워.. 채원이의 생일을 맞이해서 채원이와의 추억을 이렇게 돌아보고 떠올릴 수 있어서 너무 기쁘고 감사해.. 
       채원아! 생일 다시한번 너무나 축하하고 앞으로 서로의 인생에 변함없이 아름다운 선물이 되어주자!! 넘넘 사랑해🫶
       울 자기의 하나뿐인 자기, 너구리가🦝`,
    },
  ]

  return (
    <div className="min-h-screen bg-romantic-gradient">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button asChild variant="ghost" className="text-romantic-text hover:text-romantic-pink-deep">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back Home</span>
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-romantic-pink-deep animate-heart-beat" />
            <span className="font-serif text-xl text-romantic-text font-semibold">Love Letter</span>
          </div>
        </div>
      </nav>

      {/* Letter Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-romantic-pink-light rounded-full opacity-30 animate-float"></div>
          <div
            className="absolute -bottom-8 -right-8 w-20 h-20 bg-romantic-cream-light rounded-full opacity-40 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Letter Paper */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23000000&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;7&quot; cy=&quot;7&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

            {/* Letter content */}
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 text-romantic-pink-deep mb-4">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium">
                    Page {currentPage + 1} of {letterPages.length}
                  </span>
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h2 className="font-serif text-3xl text-romantic-text mb-6 text-center">
                  {letterPages[currentPage].title}
                </h2>

                <div className="text-romantic-text leading-relaxed text-lg font-light whitespace-pre-line">
                  {letterPages[currentPage].content}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-romantic-sky-light">
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                  className="border-romantic-sky-deep text-romantic-sky-deep hover:bg-romantic-sky-light disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {letterPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentPage ? "bg-romantic-pink-deep" : "bg-romantic-sky-light hover:bg-romantic-sky"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(letterPages.length - 1, currentPage + 1))}
                  disabled={currentPage === letterPages.length - 1}
                  variant="outline"
                  className="border-romantic-sky-deep text-romantic-sky-deep hover:bg-romantic-sky-light disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          {currentPage === letterPages.length - 1 && (
            <div className="text-center mt-8 animate-fade-in">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <p className="text-romantic-text mb-4 font-medium">Ready to see all our beautiful memories?</p>
                <Button asChild className="bg-romantic-sky-deep hover:bg-romantic-sky text-white rounded-full">
                  <Link href="/gallery" className="flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>View Our Photo Gallery</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
